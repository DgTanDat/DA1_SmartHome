#ifndef _FAN_H_
#define _FAN_H_
#include <stdio.h>
#include "driver/ledc.h"
#include "esp_err.h"

#define LEDC_TIMER              LEDC_TIMER_0
#define LEDC_MODE               LEDC_LOW_SPEED_MODE
#define LEDC_OUTPUT_IO          (22) // Define the output GPIO
#define LEDC_CHANNEL            LEDC_CHANNEL_0
#define LEDC_DUTY_RES           LEDC_TIMER_13_BIT // Set duty resolution to 13 bits
#define LEDC_DUTY               (4096) // Set duty to 50%. (2 ** 13) * 50% = 4096
#define LEDC_FREQUENCY          (100) // Frequency in Hertz. Set frequency at 4 kHz

enum{
    FAN_LEVEL_0,
    FAN_LEVEL_1,
    FAN_LEVEL_2,
    FAN_LEVEL_3,
};

esp_err_t motor_set_speed(int duty);
void motor_init();
#endif