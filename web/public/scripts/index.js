// function to plot values on charts
function plotValues(chart, timestamp, value){
  var x = timestamp;
  var y = value ;
  if(chart.series[0].data.length > 24) {
    chart.series[0].addPoint([x, y], true, true, true);
  } else {
    chart.series[0].addPoint([x, y], true, false, true);
  }
}

// DOM elements
const loginElement = document.querySelector('#login-form');
const contentElement = document.querySelector("#content-sign-in");
const userDetailsElement = document.querySelector('#user-details');
const authBarElement = document.querySelector('#authentication-bar');
const viewDataButtonElement = document.getElementById('view-data-button');
const hideDataButtonElement = document.getElementById('hide-data-button');
const tableContainerElement = document.querySelector('#table-container');
const loadDataButtonElement = document.getElementById('load-data');
const loginBoxElement = document.getElementById('login-box')
const topNavElement = document.getElementById('top-nav');
const timerValueElement = document.getElementById('ltimer');
const timerElement = document.getElementById("timer_box");

// DOM elements for sensor readings
const cardsReadingsElement = document.querySelector("#cards-div");
const chartsDivElement = document.querySelector('#charts-div');
const tempElement = document.getElementById("temp");
const humElement = document.getElementById("hum");
const humanElement = document.getElementById("pres");
const brnsElement = document.getElementById("brns");
const modeElement = document.getElementById("mode");
const updateElement = document.getElementById("lastUpdate");
const responseElement = document.getElementById("lastResponse");
const dstateElement = document.getElementById("door_state");
const fstateElement = document.getElementById("fan_state");
const lstateElement = document.getElementById("light_state");


//button 
const startBtn = document.getElementById('start-btn');
const transcript = document.getElementById('transcript');
const dBtnCl = document.getElementById('door-btncl');
const dBtnOp = document.getElementById('door-btnop');
const lBtnOff = document.getElementById('light-btnoff');
const lBtnOn = document.getElementById('light-btnon');
const fBtnOff = document.getElementById('fan-btnoff');
const fBtnOn1 = document.getElementById('fan-btnon1');
const fBtnOn2 = document.getElementById('fan-btnon2');
const setTimer = document.getElementById('set_timer_btn');
const clrTimer = document.getElementById('clr_timer_btn');

//image
const fanImg = document.getElementById('fanimg');
const lightImg = document.getElementById('lightimg');
const doorImg = document.getElementById('doorimg');

// MANAGE LOGIN/LOGOUT UI
const setupUI = (user) => {
  if (user) {
    //toggle UI elements
    topNavElement.style.display = 'block';
    loginBoxElement.style.display = 'none';
    loginElement.style.display = 'none';
    contentElement.style.display = 'block';
    authBarElement.style.display ='block';
    userDetailsElement.style.display ='block';
    userDetailsElement.innerHTML = user.email;

    // get user UID to get data from database
    var uid = user.uid;
    console.log(uid);

    // Database paths (with user UID)
    // var dbPath = 'UsersData/' + uid.toString() + '/readings';
    // var chartPath = 'UsersData/' + uid.toString() + '/charts/range';

    // Database references
    var dbRef = firebase.database().ref('SmartHome/SensorData');
    var moderef = firebase.database().ref('SmartHome/');
    var deviceref = firebase.database().ref('SmartHome/devices');
    var timerref = firebase.database().ref('SmartHome/lighttimer');
    var resref = firebase.database().ref('SmartHome/devices_stateCheck');
    
    var doorState;
    var fanState;
    var lightState;

    //voice recognition
    var recognizing = false;
    var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
    var recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = 'vi-VN'; // Đặt ngôn ngữ là tiếng Việt
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.onstart = function() {
        recognizing = true;
        transcript.textContent = 'Hãy bắt đầu nói...';
        startBtn.textContent = 'RECORDING...';
    }
    recognition.onerror = function(event) {
        transcript.textContent = 'Lỗi nhận diện: ' + event.error;
    }
    recognition.onend = function() {
        recognizing = false;
        startBtn.textContent = 'START';
    }
    recognition.onresult = function(event) {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                transcript.textContent = event.results[i][0].transcript;
            } else {
                interimTranscript += event.results[i][0].transcript;
            }
        }
        transcript.textContent = interimTranscript;
    }

    function mouseDown() {
        recognition.start();
    }

    function mouseUp() {
        if (recognizing) {
          var json = {};
          if(transcript.textContent.search("mở đèn") != -1  || transcript.textContent.search("Mở đèn") != -1 || transcript.textContent.search("Mở Đèn") != -1
          || transcript.textContent.search("bật đèn") != -1 || transcript.textContent.search("Bật đèn") != -1 || transcript.textContent.search("Bật Đèn") != -1)
          {
            json.light = '1';
          }
          if(transcript.textContent.search("tắt đèn") != -1  || transcript.textContent.search("Tắt đèn") != -1 || transcript.textContent.search("Tắt Đèn") != -1)
          {
            json.light = '0';           
          }
          if(transcript.textContent.search("mở cửa") != -1  || transcript.textContent.search("Mở cửa") != -1 || transcript.textContent.search("Mở Cửa") != -1)
          {
            json.door = '1';             
          }
          if(transcript.textContent.search("đóng cửa") != -1  || transcript.textContent.search("Đóng cửa") != -1 || transcript.textContent.search("Đóng Cửa") != -1)
          {
            json.door = '0';                
          }
          
          if(transcript.textContent.search("bật quạt số 2") != -1  || transcript.textContent.search("Bật quạt số 2") != -1 || transcript.textContent.search("Bật Quạt số 2") != -1 
          || transcript.textContent.search("Bật Quạt Số 2") != -1)
          {
            json.fan = '2';            
          }
          else if(transcript.textContent.search("bật quạt số 1") != -1  || transcript.textContent.search("Bật quạt số 1") != -1 || transcript.textContent.search("Bật Quạt số 1") != -1 
          || transcript.textContent.search("Bật Quạt Số 1") != -1)
          {
            json.fan = '1';            
          } 
          else if(transcript.textContent.search("bật quạt") != -1  || transcript.textContent.search("Bật quạt") != -1 || transcript.textContent.search("Bật Quạt") != -1 
          || transcript.textContent.search("mở quạt") != -1 || transcript.textContent.search("Mở quạt") != -1 || transcript.textContent.search("Mở Quạt") != -1)
          {
            json.fan = '1';            
          }
          else if(transcript.textContent.search("tắt quạt") != -1  || transcript.textContent.search("Tắt quạt") != -1 || transcript.textContent.search("Tắt Quạt") != -1)
          {
            json.fan = '0';         
          }
          
          deviceref.update(json);
          recognition.stop();
          transcript.textContent = '';
          return;
        }
    };

    startBtn.addEventListener("mouseup", mouseUp);
    startBtn.addEventListener("mousedown", mouseDown);
    startBtn.addEventListener("touchstart", mouseDown);
    startBtn.addEventListener("touchend", mouseUp);

    // CHARTS
    chartT = createTemperatureChart();
    chartH = createHumidityChart();
    chartB = createBrightnessChart();
    chartHP = createHumanPresenceChart();

    dbRef.orderByKey().limitToLast(25).on('value', function(snapshot) {
      if (snapshot.exists()) {
        snapshot.forEach(element => {
          var jsonData = element.toJSON();
          var temp = jsonData.temperature;
          var humid = jsonData.humidity;
          var tstmp = jsonData.timeStamp;
          var brn = jsonData.brightness;
          var hp = jsonData.human_presence;
          plotValues(chartT, tstmp, temp);
          plotValues(chartH, tstmp, humid);
          plotValues(chartB, tstmp, brn);
          plotValues(chartHP, tstmp, hp);
        });
      }
    });

    // CARDS
    moderef.limitToLast(1).on('value', snapshot =>{
      var jsonData = snapshot.toJSON();
      var mode = jsonData.mode;
      modeElement.innerHTML = mode;
      if(mode == 'manual'){
        $('#mode_checkbox').prop('checked', true);
        startBtn.style.display = 'inline-block';
        dBtnCl.style.display = 'inline-block';
        dBtnOp.style.display = 'inline-block';
        lBtnOn.style.display = 'inline-block';
        lBtnOff.style.display = 'inline-block';
        fBtnOff.style.display = 'inline-block';
        fBtnOn1.style.display = 'inline-block';
        fBtnOn2.style.display = 'inline-block';
        timerElement.style.display = 'block';
      }
      else{
        $('#mode_checkbox').prop('checked', false);
        startBtn.style.display = 'none';
        dBtnCl.style.display = 'none';
        dBtnOp.style.display = 'none';
        lBtnOn.style.display = 'none';
        lBtnOff.style.display = 'none';
        fBtnOff.style.display = 'none';
        fBtnOn1.style.display = 'none';
        fBtnOn2.style.display = 'none';
        timerElement.style.display = 'none';
      }
    });
    
    // Get the latest readings and display on cards
    dbRef.orderByKey().limitToLast(1).on('child_added', snapshot =>{
      var jsonData = snapshot.toJSON(); 
      var temperature = jsonData.temperature;
      var humidity = jsonData.humidity;
      var human_presence = jsonData.human_presence;
      var bness = jsonData.brightness;
      var timest = jsonData.timeStamp;
      let haveHuman;
      if(human_presence == '1') 
      {
        haveHuman = "Yes";
      }
      else
      {
        haveHuman = "No";
      }
      // Update DOM elements
      tempElement.innerHTML = temperature;
      humElement.innerHTML = humidity;
      humanElement.innerHTML = haveHuman;
      brnsElement.innerHTML = bness;
      updateElement.innerHTML = timest;
    });

    //get device's state
    deviceref.orderByKey().on('value', snapshot => {
      var jsonData = snapshot.toJSON(); 
      doorState = jsonData.door;
      fanState = jsonData.fan;
      lightState = jsonData.light;
      if(doorState == '1'){
        doorImg.src = "image/doorOPEN.png";
      }
      else{
        doorImg.src = "image/doorCLOSE.png";
      }
      if(lightState == '1'){
        lightImg.src = "image/lightON.png";
      }
      else{
        lightImg.src = "image/lightOFF.png";
      }
      if(fanState == '2'){
        fanImg.src = "image/fan2.png"
      }
      else if(fanState == '1'){
        fanImg.src = "image/fan1.png"
      }
      else{
        fanImg.src = "image/fan0.png"
      }
    });

    //compare response state with system state
    resref.on('value', snapshot =>{
      var json = snapshot.toJSON();
      var restime = json.timeStamp;
      var door = json.door;
      var fan = json.fan;
      var light = json.light;
      if(door == '-1'){
        alert('Door have some problems!');
      }
      if(fan == '-1'){
        alert('Fan have some problems!');
      }
      if(light == '-1'){
        alert('Light have some problems!');
      }
      console.log(door);
      console.log(doorState);
      console.log(fan);
      console.log(fanState);
      console.log(light);
      console.log(lightState);
      responseElement.innerHTML = restime;
    });

    //Switch change mode
    $('#mode_checkbox').change(function(){
      if(this.checked) {
        moderef.update({
          'mode': 'manual'
        });
        startBtn.style.display = 'inline-block';
        dBtnCl.style.display = 'inline-block';
        dBtnOp.style.display = 'inline-block';
        lBtnOn.style.display = 'inline-block';
        lBtnOff.style.display = 'inline-block';
        fBtnOff.style.display = 'inline-block';
        fBtnOn1.style.display = 'inline-block';
        fBtnOn2.style.display = 'inline-block';
        timerElement.style.display = 'block';
      }
      else {
        moderef.update({
          'mode': 'auto'
        });
        startBtn.style.display = 'none';
        dBtnCl.style.display = 'none';
        dBtnOp.style.display = 'none';
        lBtnOn.style.display = 'none';
        lBtnOff.style.display = 'none';
        fBtnOff.style.display = 'none';
        fBtnOn1.style.display = 'none';
        fBtnOn2.style.display = 'none';
        timerElement.style.display = 'none';
      }
    });
    

    dBtnCl.addEventListener('click', (e) => {
      deviceref.update({
        'door': '0'
      });
    });

    dBtnOp.addEventListener('click', (e) => {
      deviceref.update({
        'door': '1'
      });
    });

    lBtnOff.addEventListener('click', (e) => {
      deviceref.update({
        'light': '0'
      });
    });

    lBtnOn.addEventListener('click', (e) => {
      deviceref.update({
        'light': '1'
      });
    });

    fBtnOff.addEventListener('click', (e) => {
      deviceref.update({
        'fan': '0'
      });
    });

    fBtnOn1.addEventListener('click', (e) => {
      deviceref.update({
        'fan': '1'
      });
    });

    fBtnOn2.addEventListener('click', (e) => {
      deviceref.update({
        'fan': '2'
      });
    });

    setTimer.addEventListener('click', (e) => {
      var timerValue = timerValueElement.value;
      if(timerValue !== ''){
        var json = {};
        json.enable = 'true';
        json.timerValue = timerValue;
        timerref.update(json);
        alert('Đã đặt thời gian hẹn giờ mở đèn!');
      }
      else{
        alert('Vui lòng chọn thời gian!');
      }
    });

    clrTimer.addEventListener('click', (e) => {
      var json = {};
      json.enable = 'false';
      timerref.update(json);
      alert('Đã hủy hẹn giờ!');
    });

    // TABLE
    // Function that creates the table with the first 100 readings
    function createTable(){
      $('#tbody').empty();
      // append all data to the table
      dbRef.orderByKey().limitToLast(10).on('child_added', function(snapshot) {
        if (snapshot.exists()) {
          var jsonData = snapshot.toJSON();
          console.log(jsonData);
          var temperature = jsonData.temperature;
          var humidity = jsonData.humidity;
          var timestamp = jsonData.timeStamp;
          var brightness = jsonData.brightness;
          var humanPresence = jsonData.human_presence;
          var content = '';
          content += '<tr>';
          content += '<td>' + timestamp + '</td>'; 
          content += '<td>' + temperature + '</td>';
          content += '<td>' + humidity + '</td>';
          content += '<td>' + humanPresence + '</td>';
          content += '<td>' + brightness + '</td>';
          content += '</tr>';
          $('#tbody').prepend(content);
        }
      });
    };

    // append readings to table (after pressing More results... button)
    function appendToTable(){
      $('#tbody').empty();
      console.log("APEND");
      var rows = [];
      dbRef.orderByKey().limitToLast(100).on('value', function(snapshot) {
        // convert the snapshot to JSON
        if (snapshot.exists()) {
          snapshot.forEach(element => {
            var jsonData = element.toJSON();
            var temperature = jsonData.temperature;
            var humidity = jsonData.humidity;
            var timestamp = jsonData.timeStamp;
            var brightness = jsonData.brightness;
            var humanPresence = jsonData.human_presence;
            var content = '';
            content += '<tr>';
            content += '<td>' + timestamp + '</td>';
            content += '<td>' + temperature + '</td>';
            content += '<td>' + humidity + '</td>';
            content += '<td>' + humanPresence + '</td>';
            content += '<td>' + brightness + '</td>';
            content += '</tr>';
            rows.push(content);
          });
          rows.reverse();
          rows.forEach(row => {
            $('#tbody').append(row);
          });
        }
      });
    }

    viewDataButtonElement.addEventListener('click', (e) =>{
      // Toggle DOM elements
      tableContainerElement.style.display = 'block';
      viewDataButtonElement.style.display ='none';
      hideDataButtonElement.style.display ='inline-block';
      loadDataButtonElement.style.display = 'inline-block';
      createTable();
    });

    loadDataButtonElement.addEventListener('click', (e) => {
      appendToTable();
    });

    hideDataButtonElement.addEventListener('click', (e) => {
      tableContainerElement.style.display = 'none';
      viewDataButtonElement.style.display = 'inline-block';
      hideDataButtonElement.style.display = 'none';
      loadDataButtonElement.style.display = 'none'
    });

  // IF USER IS LOGGED OUT
  } else{
    // toggle UI elements
    topNavElement.style.display = 'none';
    loginBoxElement.style.display = 'block';
    loginElement.style.display = 'block';
    authBarElement.style.display ='none';
    userDetailsElement.style.display ='none';
    contentElement.style.display = 'none';
  }
}