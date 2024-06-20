// Create the charts when the web page loads
window.addEventListener('load', onload);

function onload(event){
  chartT = createTemperatureChart();
  chartH = createHumidityChart();
  chartB = createBrightnessChart();
  chartHP = createHumanPresenceChart();
}

// Create Temperature Chart
function createTemperatureChart() {
  var chart = new Highcharts.Chart({
    chart:{ 
      renderTo:'chart-temperature',
      type: 'spline' 
    },
    series: [
      {
        name: 'DHT22'
      }
    ],
    title: { 
      text: undefined
    },
    plotOptions: {
      line: { 
        animation: false,
        dataLabels: { 
          enabled: true 
        }
      }
    },
    xAxis: {
      title: { 
        text: 'Time' 
      }
    },
    yAxis: {
      title: { 
        text: 'Temperature Celsius Degrees' 
      }
    },
    credits: { 
      enabled: false 
    }
  });
  return chart;
}

// Create Humidity Chart
function createHumidityChart(){
  var chart = new Highcharts.Chart({
    chart:{ 
      renderTo:'chart-humidity',
      type: 'spline'  
    },
    series: [{
      name: 'DHT22'
    }],
    title: { 
      text: undefined
    },    
    plotOptions: {
      line: { 
        animation: false,
        dataLabels: { 
          enabled: true 
        }
      },
      series: { 
        color: '#50b8b4' 
      }
    },
    xAxis: {
      title: { 
        text: 'Time' 
      }
    },
    yAxis: {
      tickPositions: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
      title: { 
        text: 'Humidity (%)' 
      }
    },
    credits: { 
      enabled: false 
    }
  });
  return chart;
}

// Create Brightness Chart
function createBrightnessChart(){
  var chart = new Highcharts.Chart({
    chart:{ 
      renderTo:'chart-brightness',
      type: 'spline'  
    },
    series: [{
      name: 'LDR'
    }],
    title: { 
      text: undefined
    },    
    plotOptions: {
      line: { 
        animation: false,
        dataLabels: { 
          enabled: true 
        }
      },
      series: { 
        color: '#50b8b4' 
      }
    },
    xAxis: {
      title: { 
        text: 'Time' 
      }
    },
    yAxis: {
      tickPositions: [0, 1000, 2000, 3000, 4095],
      title: { 
        text: 'Brightness' 
      }
    },
    credits: { 
      enabled: false 
    }
  });
  return chart;
}

// Create HumanPresence Chart
function createHumanPresenceChart(){
  var chart = new Highcharts.Chart({
    chart:{ 
      renderTo:'chart-humanpresence',
      type: 'spline'  
    },
    series: [{
      name: 'LD2410'
    }],
    title: { 
      text: undefined
    },    
    plotOptions: {
      line: { 
        animation: false,
        dataLabels: { 
          enabled: true 
        }
      },
      series: { 
        color: '#00add6' 
      }
    },
    xAxis: {
      title: { 
        text: 'Time' 
      }
    },
    yAxis: {
      tickPositions: [0, 1],
      title: {  
        text: 'Yes/No (1/0)' 
      }
    },
    credits: { 
      enabled: false 
    }
  });
  return chart;
}



