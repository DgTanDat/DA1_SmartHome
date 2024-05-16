#include <stdio.h>
#include "stdlib.h"
#include "dht22.h"
#include "esp_log.h"
#include <freertos/FreeRTOS.h>
#include <string.h>

static portMUX_TYPE mux = portMUX_INITIALIZER_UNLOCKED;
#define PORT_ENTER_CRITICAL() portENTER_CRITICAL(&mux)
#define PORT_EXIT_CRITICAL() portEXIT_CRITICAL(&mux)

// DHT timer precision in microseconds
#define DHT_TIMER_INTERVAL 2
#define DHT_DATA_BITS 40
#define DHT_DATA_BYTES (DHT_DATA_BITS / 8)

static const char *DHT_TAG = "dht";

static esp_err_t dht_await_pin_state(gpio_num_t pin, uint32_t timeout, int expected_pin_state, uint32_t *duration)
{
    gpio_set_direction(pin, GPIO_MODE_INPUT);
    for (uint32_t i = 0; i < timeout; i += DHT_TIMER_INTERVAL)
    {
        esp_rom_delay_us(DHT_TIMER_INTERVAL);
        if (gpio_get_level(pin) == expected_pin_state)
        {
            if (duration)
            {
                *duration = i;
            }
            return ESP_OK;
        }
    }

    return ESP_ERR_TIMEOUT;
}

static inline esp_err_t dht_fetch_data(gpio_num_t pin, uint8_t data[DHT_DATA_BYTES])
{
    uint32_t low_duration;
    uint32_t high_duration;

    gpio_set_direction(pin, GPIO_MODE_OUTPUT_OD);
    gpio_set_level(pin, 0);
    esp_rom_delay_us(5000);
    gpio_set_level(pin, 1);
    
    esp_err_t ret;
    ret = dht_await_pin_state(pin, 40, 0, NULL);
    if(ret < 0)
    {
        ESP_LOGE(DHT_TAG, "Initialization error, problem in phase 'B'");
    }
    
    ret = dht_await_pin_state(pin, 88, 1, NULL);
    if(ret < 0)
    {
        ESP_LOGE(DHT_TAG, "Initialization error, problem in phase 'C'");
    }

    ret = dht_await_pin_state(pin, 88, 0, NULL);
    if(ret < 0)
    {
        ESP_LOGE(DHT_TAG, "Initialization error, problem in phase 'D'");
    }

    for (int i = 0; i < DHT_DATA_BITS; i++)
    {
        ret = dht_await_pin_state(pin, 65, 1, &low_duration);
        if(ret < 0)
        {
            ESP_LOGE(DHT_TAG, "LOW bit timeout");
        }
        ret = dht_await_pin_state(pin, 75, 0, &high_duration);
        if(ret < 0)
        {
            ESP_LOGE(DHT_TAG, "HIGH bit timeout");
        }
        uint8_t b = i / 8;
        uint8_t m = i % 8;
        if (!m)
        {
            data[b] = 0;
        }   
        data[b] |= (high_duration > low_duration) << (7 - m); //compare low and high duration to decide bit value 0 or 1
    }

    return ESP_OK;
}

/**
 * Pack two data bytes into single value and take into account sign bit.
 */
static inline int16_t dht_convert_data(uint8_t msb, uint8_t lsb)
{
    int16_t data;
    data = msb & 0x7F;
    data <<= 8;
    data |= lsb;
    if (msb & BIT(7))
    {
        data = -data;
    }
    return data;
}

esp_err_t dht_read_data(gpio_num_t pin, int16_t *humidity, int16_t *temperature)
{
    uint8_t data[DHT_DATA_BYTES] = { 0 };

    gpio_set_direction(pin, GPIO_MODE_OUTPUT_OD);
    gpio_set_level(pin, 1);

    PORT_ENTER_CRITICAL();
    esp_err_t result = dht_fetch_data(pin, data);
    PORT_EXIT_CRITICAL();
    if (result != ESP_OK)
    {
        return result;
    }

    if (data[4] != ((data[0] + data[1] + data[2] + data[3]) & 0xFF))
    {
        ESP_LOGE(DHT_TAG, "Checksum failed, invalid data received from sensor");
        return ESP_ERR_INVALID_CRC;
    }

    *humidity = dht_convert_data(data[0], data[1]);
    *temperature = dht_convert_data(data[2], data[3]);

    ESP_LOGD(DHT_TAG, "Sensor data: humidity=%d, temp=%d", *humidity, *temperature);

    return ESP_OK;
}

esp_err_t dht_read_float_data(gpio_num_t pin, float *humidity, float *temperature)
{
    int16_t i_humidity, i_temp;

    esp_err_t res = dht_read_data(pin, &i_humidity, &i_temp);
    if (res != ESP_OK)
    {
        return res;
    }
    *humidity = i_humidity / 10.0;
    *temperature = i_temp / 10.0;

    return ESP_OK;
}