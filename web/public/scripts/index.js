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
// const chartsRangeInputElement = document.getElementById('charts-range');
const loadDataButtonElement = document.getElementById('load-data');

// DOM elements for sensor readings
const cardsReadingsElement = document.querySelector("#cards-div");
const chartsDivElement = document.querySelector('#charts-div');
const tempElement = document.getElementById("temp");
const humElement = document.getElementById("hum");
const humanElement = document.getElementById("pres");
const brnsElement = document.getElementById("brns");
const modeElement = document.getElementById("mode");
const updateElement = document.getElementById("lastUpdate");
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

//image
const fanImg = document.getElementById('fanimg');
const lightImg = document.getElementById('lightimg');
const doorImg = document.getElementById('doorimg');

// MANAGE LOGIN/LOGOUT UI
const setupUI = (user) => {
  if (user) {
    //toggle UI elements
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
    var dbRef = firebase.database().ref('firebase');
    var moderef = firebase.database().ref('/');
    var deviceref = firebase.database().ref('devices');
    
    //voice recognition
    let recognizing = false;
    let recognition = new window.webkitSpeechRecognition() || new window.SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = 'vi-VN'; // Đặt ngôn ngữ là tiếng Việt
    recognition.interimResults = true;
    recognition.maxAlternatives = 1
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
    startBtn.onclick = function() {
      return;
    }

    startBtn.onmousedown = function() {
        recognition.start();
    }
    startBtn.onmouseup = function() {
        if (recognizing) {
            if(transcript.textContent.search("mở đèn") != -1  || transcript.textContent.search("Mở đèn") != -1)
            {
              deviceref.update({
                'Light': 1
              });
              alert("Đã mở đèn!"); 
            }
            if(transcript.textContent.search("tắt đèn") != -1  || transcript.textContent.search("Tắt đèn") != -1)
            {
              deviceref.update({
                'Light': 0
              });
              alert("Đã tắt đèn!");            
            }
            if(transcript.textContent.search("mở cửa") != -1  || transcript.textContent.search("Mở cửa") != -1)
            {
              deviceref.update({
                'Door': 1
              });
              alert("Đã mở cửa!");                
            }
            if(transcript.textContent.search("đóng cửa") != -1  || transcript.textContent.search("Đóng cửa") != -1)
            {
              deviceref.update({
                'Door': 0
              });
              alert("Đã đóng cửa!");                
            }
            if(transcript.textContent.search("bật quạt") != -1  || transcript.textContent.search("Bật quạt") != -1 || transcript.textContent.search("mở quạt") != -1)
            {
              deviceref.update({
                'Fan': 1
              });
              alert("Đã bật quạt mức 1!");                
            }
            if(transcript.textContent.search("tắt quạt") != -1  || transcript.textContent.search("Tắt quạt") != -1)
            {
              deviceref.update({
                'Fan': 0
              });
              alert("Đã tắt quạt!");                
            }
            if(transcript.textContent.search("lạnh quá") != -1  || transcript.textContent.search("giảm tốc độ quạt") != -1)
            {
                alert("Đã giảm tốc độ quạt!");
            }
            recognition.stop();
            return;
        }
    };

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
      }
    });
    // Get the latest readings and display on cards
    dbRef.orderByKey().limitToLast(1).on('child_added', snapshot =>{
      var jsonData = snapshot.toJSON(); 
      var temperature = jsonData.temperature;
      var humidity = jsonData.humidity;
      var human_presence = jsonData.human_presence;
      var bness = jsonData.brightness;
      var timest = jsonData.timeStamp
      let haveHuman;
      if(human_presence == 1) 
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
      var doorState = jsonData.Door;
      var fanState = jsonData.Fan;
      var lightState = jsonData.Light;
      if(doorState == 1){
        doorImg.src = "image/doorOPEN.png";
      }
      else{
        doorImg.src = "image/doorCLOSE.png";
      }
      if(lightState == 1){
        lightImg.src = "image/lightON.png";
      }
      else{
        lightImg.src = "image/lightOFF.png";
      }
      if(fanState == 2){
        fanImg.src = "image/fan2.png"
      }
      else if(fanState == 1){
        fanImg.src = "image/fan1.png"
      }
      else{
        fanImg.src = "image/fan0.png"
      }
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
      }
    });

    dBtnCl.addEventListener('click', (e) => {
      deviceref.update({
        'Door': 0
      });
    });

    dBtnOp.addEventListener('click', (e) => {
      deviceref.update({
        'Door': 1
      });
    });

    lBtnOff.addEventListener('click', (e) => {
      deviceref.update({
        'Light': 0
      });
    });

    lBtnOn.addEventListener('click', (e) => {
      deviceref.update({
        'Light': 1
      });
    });

    fBtnOff.addEventListener('click', (e) => {
      deviceref.update({
        'Fan': 0
      });
    });

    fBtnOn1.addEventListener('click', (e) => {
      deviceref.update({
        'Fan': 1
      });
    });

    fBtnOn2.addEventListener('click', (e) => {
      deviceref.update({
        'Fan': 2
      });
    });

    // TABLE
    var lastReadingTimestamp; //saves last timestamp displayed on the table
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
    loginElement.style.display = 'block';
    authBarElement.style.display ='none';
    userDetailsElement.style.display ='none';
    contentElement.style.display = 'none';
  }
}