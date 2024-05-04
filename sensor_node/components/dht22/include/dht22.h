#ifndef __DHT_H__
#define __DHT_H__

#include <driver/gpio.h>
#include <esp_err.h>

esp_err_t dht_read_data(gpio_num_t pin, int16_t *humidity, int16_t *temperature);
esp_err_t dht_read_float_data(gpio_num_t pin, float *humidity, float *temperature);

#endif  // __DHT_H__
