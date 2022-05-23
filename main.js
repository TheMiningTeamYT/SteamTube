/*
Written By:
Logan C.

Inspired By / Replicating:
https://www.wonder-tonic.com/steamtube/

With help from:
Logan C.'s Dad
The good people of Stack Overflow.
w3schools.com
The Caret text editor
Microsoft Visual Studio Code
Pop-Tarts.
Mio-Water.
The JPEXS Flash .swf decomplier.
Notepad.
The Desmos Graphing Calculator.
LOTS OF HELP FROM: The BabelJS JS converter.
*/
// This code up here is a Firefox 35 compatible way to create a class.
// The following section was created by the BabelJS JS Converter.
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

// Create the Timer object I'm going to use to keep track of time elapsed.
var Timer = /*#__PURE__*/function () {
  function Timer() {
    _classCallCheck(this, Timer);

    this.startDate = new Date();
  }

  _createClass(Timer, [{
    key: "timeElapsed",
    value: function timeElapsed() {
      // Thank you JellicleCat of Stack Overflow!
      var seconds = Math.round((new Date() - this.startDate) / 1000);
      var timeStr = formatTime(seconds);
      return [timeStr, seconds];
    }
  }]);

  return Timer;
}(); // Thanks John-Jones and murb of Stack Overflow!
// Get the user's browser
// This is the end of the section created by the BabelJS JS converter.

function get_browser() {
  var ua = navigator.userAgent,
      tem,
      M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];

  if (/trident/i.test(M[1])) {
    tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
    return {
      name: 'IE',
      version: tem[1] || ''
    };
  }

  if (M[1] === 'Chrome') {
    tem = ua.match(/\bOPR|Edge\/(\d+)/);

    if (tem != null) {
      return {
        name: 'Opera',
        version: tem[1]
      };
    }
  }

  M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];

  if ((tem = ua.match(/version\/(\d+)/i)) != null) {
    M.splice(1, 1, tem[1]);
  }

  return {
    name: M[0],
    version: parseFloat(M[1], 10)
  };
} // Update the style of the .video class if the user is using a version of firefox prior to 52.


var browser = get_browser();

if (browser.version < 52 && (browser.name == "Firefox" || browser.name == "firefox")) {
  var videoElementArray = document.getElementsByClassName("video");
  var loops = 0;

  while (loops < videoElementArray.length) {
    videoElementArray[loops].style.top = "-111px";
    videoElementArray[loops].style.left = "-201px";
    loops++;
  }
}
// Define all the global variables I need.

var lastRotationVideo = 0;
var lastRotationAudio = 0;
var videoQuality = 0;
var audioQuality = 0;
var pressure = 0;
var playing = false;
var pressureVenting = false;
var overheating = false;
var peakQuality = false;
var playerReady = false;
var bestTime = parseFloat(localStorage.getItem("bestTime"));
// Get the difficulty
var difficulty = 6;
setDifficulty("false"); 
// Get the volume.
var volume = 100;
setVolume('false');
// Attach all the elements I need to variables.

var videoQualityControl = document.getElementById("videoQualityControl");
var audioQualityControl = document.getElementById("audioQualityControl");
var pressureVentButton = document.getElementById("pressureVent"); 
var peakQualityTimer = "";
// Make sure you don't make the player's ear's bleed.

document.getElementById("audioNoise").volume = 0.25; 
// Add event listeners for the vent pressure button.

pressureVentButton.addEventListener("mousedown", function () {
  pressureVenting = true;
  pressureVentButton.src = "assets/bigButtonPressed.png";
  setTimeout(animatePressureVentButton, 200);
});
// Add event listener for the load button.

document.getElementById("loadButton").addEventListener("click", function () {
  document.getElementById("loadButton").src = "assets/littleButtonPressed.png";
  var loadButtonAnimationTimeout = setTimeout(animateLoadButton, 200); // Stupid YouTube API won't accept normal YouTube URLs for loadVideoByUrl, so I have to do this instead.

  var videoid = document.getElementById("videoUrl").value.replace(/https\:\/\/|www.youtube.com\/watch\?v=|www.youtu.be\//g, ""); // Thanks Leo and Samina Zahid of Stack Overflow!

  var remove_after = videoid.indexOf("&");

  if (remove_after != -1) {
    videoid = videoid.substring(0, remove_after);
  } // Load video


  player.cueVideoById({
    videoId: videoid
  }); // Reset the "Turn crank to play video" screen

  document.getElementById("turnCrankToPlay").style.opacity = 1;
  document.getElementById("noise").style.opacity = 0.6; // Reset audio and video quality

  var videoQualityControlRotation = getRotation(videoQualityControl);
  var audioQualityControlRotation = getRotation(audioQualityControl);
  videoQuality = -videoQualityControlRotation;
  audioQuality = -audioQualityControlRotation;
  pressure = 0;
  playing = false;
  playerReady = false;
}); // Set all of the intervals

setInterval(videoQualityCheck, 33);
setInterval(audioQualityCheck, 33);
setInterval(pressureBuildup, 33); // Define function to check the video quality.

function videoQualityCheck() {
  // Get the current rotation of the video control.
  var rotation = getRotation(videoQualityControl); // If the user hasn't yet rotated the quality control, make sure no errors occur.

  if (isNaN(rotation)) {
    rotation = 0;
  }

  if (playing === true) {
    // If you've turned the control wheel, play a ticking sound.
    if (videoQualityControl.dataset.active == "true" || audioQualityControl.dataset.active == "true") {
      document.getElementById("tickingSound").play();
    } else {
      document.getElementById("tickingSound").pause();
    }
  } else if (playerReady === false) {
    document.getElementById("turnCrankToPlayText").innerHTML = "LOADING...";
  } else {
    document.getElementById("turnCrankToPlayText").innerHTML = "TURN THE VIDEO CRANK TO UNPAUSE VIDEO";

    if (rotation != lastRotationVideo && !isNaN(rotation) && videoQualityControl.dataset.active == "true") {
      // Start the video playing
      document.getElementById("turnCrankToPlay").style.opacity = 0;
      player.playVideo();
      playing = true; // Make sure the record scratch-esque sound is playing

      document.getElementById("recordSound").play(); // Finaly, remove the noise

      document.getElementById("noise").style.opacity = 0;
    }
  } // If you've rotated the control all the way around, add 360 to the rotation in the future.


  if (videoQualityControl.dataset.active == "true") {
    if (playing === true){
      if (rotation < lastRotationVideo - 150) {
        videoQuality += 360;
      } else if (rotation < lastRotationVideo) {
        // If you've rotated the control backwards, don't count it.
        videoQuality += lastRotationVideo - rotation;
      } else if (rotation > lastRotationVideo + 150) {
        videoQuality -= rotation - lastRotationVideo;
      }
    } else {
      videoQuality = -rotation;
    }
    // Save the current rotation of the control for future reference.
    lastRotationVideo = getRotation(videoQualityControl);
  } else {
    // Give the wheel some momentum
    var previousRotation = rotation;
    if (playing === true) {
      if (rotation < lastRotationVideo - 150) {
        videoQuality += 360;
        rotation += (rotation + 360 - lastRotationVideo) / 1.3;
      } else if (rotation > lastRotationVideo + 150) {
        videoQuality -= rotation - lastRotationVideo;
        rotation += (rotation - 360 - lastRotationVideo) / 1.3;
      } else if (rotation < lastRotationVideo) {
        videoQuality += lastRotationVideo - rotation;
        rotation += (rotation - lastRotationVideo) / 1.3;
      } else {
        rotation += (rotation - lastRotationVideo) / 1.3;
      }
    } else {
      if (rotation < lastRotationVideo - 150) {
        rotation += (rotation + 360 - lastRotationVideo) / 1.3;
      } else if (rotation > lastRotationVideo + 150) {
        rotation += (rotation - 360 - lastRotationVideo) / 1.3;
      } else if (rotation < lastRotationVideo) {
        rotation += (rotation - lastRotationVideo) / 1.3;
      } else {
        rotation += (rotation - lastRotationVideo) / 1.3;
      }
      videoQuality = -rotation;
    }
    
    lastRotationVideo = previousRotation;
    // Rotate the wheel according to the calculations above.
    videoQualityControl.style.transform = "rotate(" + rotation + "deg)";
    // Change the horizontal and vertical offset of the drop shadow so it doesn't appear to move with the wheel.
    var dropShadow = getRotationPoint(20, 20, rotation);
    videoQualityControl.style.filter = "drop-shadow(" + dropShadow[0] + "px " + dropShadow[1] + "px 3px rgba(0,0,0,0.7)";
    videoQualityControl.dataset.angle = rotation;
  } // Cap the video quality to 1600.


  videoQuality = clamp(videoQuality, -rotation, 1600 - rotation); // If the video quality isn't already 0, slowly bring it down.

  if (Math.floor(videoQuality + rotation) > 0) {
    videoQuality -= difficulty / 2;
  } // Set the opacity of the video noise according to the video quality.
  // 520 = the target video quality (1300) divied by the target max blur (10px)


  if (10 - (rotation + videoQuality) / 130 < 0.5) {
    document.getElementById("player").style.filter = "blur(0px)";
  } else {
    document.getElementById("player").style.filter = "blur(" + (10 - (rotation + videoQuality) / 130) + "px)";
  } // If you've maxed out the video quality, don't rotate the dial any further.


  if (rotation + videoQuality > 1600) {
    document.getElementById("videoDial").style.transform = "rotate(" + (1600 / 6.4 - 125) + "deg)";
  } else {
    // Otherwise, rotate the dial accordingly.
    document.getElementById("videoDial").style.transform = "rotate(" + ((rotation + videoQuality) / 6.4 - 125) + "deg)";
  } // Get the current rotation of the audio control.


  var audioQualityControlRotation = getRotation(audioQualityControl);

  if (audioQualityControlRotation < lastRotationAudio - 150) {
    audioQualityControlRotation += 360;
  } // Finally, check if you're at peak quality.


  if (peakQuality === false && videoQuality + rotation >= 1325 && audioQuality + audioQualityControlRotation >= 1300 && playing === true) {
    peakQuality = true;
    // This timer keeps track of how long the user has kept the video at peak quality.
    peakQualityTimer = new Timer();
    document.getElementById("peakQualityLight").src = "assets/peakQuality.png";
    document.getElementById("bestTimeDiv").style.backgroundImage = "url('assets/bestTime.png')";
  } else if (peakQuality === true && (videoQuality + rotation < 1325 || audioQuality + audioQualityControlRotation < 1300)) {
    peakQuality = false;
    document.getElementById("peakQualityLight").src = "assets/notPeakQuality.png";
    document.getElementById("bestTimeDiv").style.backgroundImage = "url('assets/notBestTime.png')";
    document.getElementById("bestTimeText").innerHTML = "0:00";
  } else if (peakQuality === true) {
    var peakQualityTime = peakQualityTimer.timeElapsed();
    document.getElementById("bestTimeText").innerHTML = peakQualityTime[0];

    if (peakQualityTime[1] > bestTime) {
      localStorage.setItem("bestTime", peakQualityTime[1]);
      bestTime = peakQualityTime[1];
      document.getElementById("bestTimeRecord").innerHTML = formatTime(bestTime);
    }
  }
} // Define function to check the audio quality.


function audioQualityCheck() {
  // Get the current rotation of the audio quality control.
  var rotation = getRotation(audioQualityControl); // If the user hasn't yet rotated the quality control, make sure no errors occur.

  if (isNaN(rotation)) {
    rotation = 0;
  } // If you've rotated the control all the way around, add 360 to the rotation in the future.


  if (audioQualityControl.dataset.active == "true") {
    if (playing === true){
      if (rotation < lastRotationAudio - 150) {
        audioQuality += 360;
      } else if (rotation < lastRotationAudio) {
        // If you've rotated the control backwards, don't count it.
        audioQuality += lastRotationAudio - rotation;
      } else if (rotation > lastRotationAudio + 150) {
        audioQuality -= rotation - lastRotationAudio;
      }
    } else {
      audioQuality = -rotation;
    }
    // Save the current rotation of the control for future reference.
    lastRotationAudio = getRotation(audioQualityControl);
  } else {
    // Give the wheel some momentum
    var previousRotation = rotation;
    if (playing === true) {
      if (rotation < lastRotationAudio - 150) {
        audioQuality += 360;
        rotation += (rotation + 360 - lastRotationAudio) / 1.3;
      } else if (rotation > lastRotationAudio + 150) {
        audioQuality -= rotation - lastRotationAudio;
        rotation += (rotation - 360 - lastRotationAudio) / 1.3;
      } else if (rotation < lastRotationAudio) {
        audioQuality += lastRotationAudio - rotation;
        rotation += (rotation - lastRotationAudio) / 1.3;
      } else {
        rotation += (rotation - lastRotationAudio) / 1.3;
      }
    } else {
      if (rotation < lastRotationAudio - 150) {
        rotation += (rotation + 360 - lastRotationAudio) / 1.3;
      } else if (rotation > lastRotationAudio + 150) {
        rotation += (rotation - 360 - lastRotationAudio) / 1.3;
      } else if (rotation < lastRotationAudio) {
        rotation += (rotation - lastRotationAudio) / 1.3;
      } else {
        rotation += (rotation - lastRotationAudio) / 1.3;
      }
      audioQuality = -rotation;
    }

    lastRotationAudio = previousRotation;
    // Rotate the wheel according to the calculations above.
    audioQualityControl.style.transform = "rotate(" + rotation + "deg)";
    // Change the horizontal and vertical offset of the drop shadow so it doesn't appear to move with the wheel.
    var dropShadow = getRotationPoint(20, 20, rotation);
    audioQualityControl.style.filter = "drop-shadow(" + dropShadow[0] + "px " + dropShadow[1] + "px 3px rgba(0,0,0,0.7)";
    audioQualityControl.dataset.angle = rotation;
  }
  // Cap the audio quality to 1600.
  audioQuality = clamp(audioQuality, -rotation, 1600 - rotation); // If the audio quality isn't already 0, slowly bring it down.

  if (Math.floor(audioQuality + rotation) > 0) {
    audioQuality -= difficulty / 2;
  }
  // If you've maxed out the video quality, don't rotate the dial any further.


  if (rotation + audioQuality > 1600) {
    document.getElementById("audioDial").style.transform = "rotate(" + (1600 / 6.3 - 122) + "deg)";
  } else {
    // Otherwise, rotate the dial accordingly.
    document.getElementById("audioDial").style.transform = "rotate(" + ((rotation + audioQuality) / 6.3 - 122) + "deg)";
  }
  // Get the embedded YouTube player and tell it to change the volume accordingly.


  player.setVolume(((rotation + audioQuality) / 13) * volume );
  // Start the audio noise playing if the user has started playing.

  if (playing === true) {
    document.getElementById("audioNoise").play();
  }
  // Get the audio noise and set it's volume accordingly.


  document.getElementById("audioNoise").volume = clamp(((1 - (rotation + audioQuality) / 1300) * volume), 0, 1) / 4;
}
// Get an element and return it's rotation from 0 - 360 degrees


function getRotation(target) {
  var targetRotation = parseFloat(target.style.transform.replace(/rotate\(|deg\)/g, ""));

  if (targetRotation < 0) {
    targetRotation = Math.abs(targetRotation += 360);
  }

  if (targetRotation > 360) {
    targetRotation -= 360;
  }

  return targetRotation;
} // Thanks CAFxX of Stack Overflow!
// Clamp a number to [min - max] and return it.


function clamp(number, min, max) {
  return Math.max(min, Math.min(number, max));
} // Slowly build up pressure


function pressureBuildup() {
  // Make sure the pressure isn't below 0.
  if (pressure < 0) {
    pressure = 0;
  } // If the user is attempting to vent pressure, decrease the pressure.


  if (pressureVenting === true) {
    if (pressure > 0) {
      pressure -= 2;
      document.getElementById("ventingSound").play();
    } else {
      pressureVenting = false;
    }
  } else if (playing === true) {
    // Otherwise, keep increasing it.
    pressure += 0.25 * (difficulty / 6);
  }

  if (pressure > 220) {
    // If the pressure gets too high, blow everything up and reset the pressure.
    blowUp();
  }

  if (overheating === false) {
    if (pressure >= 200) {
      overheating = true;
      document.getElementById("overheatLight").src = "assets/overheat.png";
    }
  } else if (overheating === true) {
    if (pressure < 200) {
      overheating = false;
      document.getElementById("overheatLight").src = "assets/noOverheat.png";
    }
  } // Set the pressure dial accordingly.


  document.getElementById("pressureDial").style.transform = "rotate(" + (pressure * 1.1 - 120) + "deg)";
}

function blowUp() {
  // If the pressure gets too high, cause everything to explode.
  // Reset everything.
  var videoQualityControlRotation = getRotation(videoQualityControl);
  var audioQualityControlRotation = getRotation(audioQualityControl);
  videoQuality = -videoQualityControlRotation;
  audioQuality = -audioQualityControlRotation;
  pressureVenting = true;
  // The current state of the function is a placeholder for a real explosion
}

function animateLoadButton() {
  document.getElementById("loadButton").src = "assets/littleButton.png";
}

function animatePressureVentButton() {
  pressureVentButton.src = "assets/bigButton.png";
}

function getRotationPoint(rh, ry, angle) {
  // rh is the horizontal radius
  // ry is the vertical radius
  var x = rh * Math.sin(angle * Math.PI / 180);
  var y = ry * Math.cos(angle * Math.PI / 180);
  var coordinateArray = [x, y];
  return coordinateArray;
}

function setDifficulty(changed) {
  if (changed == "true") {
    difficulty = document.getElementById("difficultySlider").value;
    localStorage.setItem("difficulty", difficulty);
  } else {
    difficulty = parseFloat(localStorage.getItem("difficulty"));

    if (isNaN(difficulty)) {
      difficulty = 6;
    }

    document.getElementById("difficultySlider").value = difficulty;
  }
  document.getElementById("difficultyLevel").innerHTML = "Please choose your difficulty level.<br>Current dificulty level is " + difficulty + ".";
} 
function setVolume(changed) {
  if (changed == "true") {
    volume = document.getElementById("volumeSlider").value / 100;
    localStorage.setItem("volume", volume);
  } else {
    volume = parseFloat(localStorage.getItem("volume"));

    if (isNaN(volume)) {
      volume = 1;
    }

  }
  document.getElementById("volumeSlider").value = volume * 100;
  document.getElementById("recordSound").volume = volume;
  document.getElementById("tickingSound").volume = volume;
  document.getElementById("volumeLevel").innerHTML = "Please choose your volume level.<br>Current volume level is " + Math.round((volume * 100)) + "%.";
} 
// Thank you Tom Esterez of Stack Overflow!

function formatTime(seconds) {
  var h = Math.floor(seconds / 3600);
  var m = Math.floor(seconds % 3600 / 60);
  var s = Math.round(seconds % 60);
  return [h, m > 9 ? m : h ? "0" + m : m || "0", s > 9 ? s : "0" + s].filter(Boolean).join(":");
}