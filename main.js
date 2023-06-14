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
The straight up black magic that is Github Copilot. I'll let it speak for itself.
"The best thing about a boolean is even if you are wrong, you are only off by a bit."
*/
// This code up here is a Firefox 35 compatible way to create a class.
// The following section was created by the BabelJS JS Converter.
"use strict";

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  Object.defineProperty(Constructor, "prototype", {
    writable: false
  });
  return Constructor;
} 

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
}();

// The videoPlayer object is to provide a more convenient way to interact with the HTML <video> object for embedding video files, as well as to add needed functions for this use case (destroy(), and the ability to embed the <video> element inside a div of a specific id).
var videoPlayer = /*#__PURE__*/function () {
  function videoPlayer(id, options) {
    _classCallCheck(this, videoPlayer);

    this.videoElement = document.createElement("VIDEO");
    this.videoElement.src = options.url;
    this.videoElement.style.height = options.height;
    this.videoElement.style.width = options.width;
    this.videoElement.style.margin = "0px";
    this.videoElement.style.backgroundColor = "black";
    this.videoElement.controls = options.controls;
    var videoElement = this.videoElement;
    this.videoElement.addEventListener("ended", function() {
      videoElement.src = "";
    });
    this.videoElement.addEventListener("loadeddata", function() {
      playerReady = true;
    })
    document.getElementById(id).appendChild(this.videoElement);
  }

  _createClass(videoPlayer, [{
    key: "play",
    value: function play() {
      this.videoElement.play();
    }
  }, {
    key: "setVolume",
    value: function setVolume(volume) {
      this.videoElement.volume = volume;
    }
  }, {
    key: "destroy",
    value: function destroy() {
      this.videoElement.remove();
    }
  }, {
    key: "setLoop",
    value: function setLoop(loop) {
      this.videoElement.loop = loop;
    }
  }]);

  return videoPlayer;
}(); 
// This is the end of the section created by the BabelJS JS converter.

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
var playerType = "YouTube";
var mobile = false;
var audioContext;
var pinkNoise;
var pinkGain;
// Define global var difficulty first so that it can be used by setDifficulty
var difficulty = 6;  
// Define global var volume first so that it can be used by setVolume
var volume = 100; 
if ((platform.os.family == "Windows XP") && (platform.version > 35 && platform.name == "Firefox")) {
   bestTime = 0;
} else {
   var bestTime = parseFloat(localStorage.getItem("bestTime"));

   if (isNaN(bestTime)) {
     bestTime = 0;
     localStorage.setItem("bestTime", bestTime);
   }

   document.getElementById("bestTimeRecord").innerHTML = formatTime(bestTime); 
   // Get the difficulty
   setDifficulty("false"); 
   // Get the volume.
   setVolume('false'); 
}

// Update the style of the .video class if the user is using a version of firefox prior to 52.
if (platform.version < 52 && platform.name == "Firefox") {
  var videoElementArray = document.getElementsByClassName("video");

  for (var loops = 0; loops < videoElementArray.length; loops++) {
    videoElementArray[loops].style.top = "-111px";
    videoElementArray[loops].style.left = "-201px";
  }
} else if (platform.os.family == "iOS" || platform.os.family == "Android") {
  // If the user is on an iOS or Android device, set the mobile variable to true.
  mobile = true;
  alert("You are playing on mobile. On mobile, autoplay may not work. If this happens, please press the \"Play\" button on the YouTube player to start the video.\nAlso note that the audio may not play on mobile, or may not play at the correct volume.\nFor the best experience, please play on desktop.");

  if (platform.os.family == "iOS") {
    document.getElementById("loadButton").style.top = "22px";
    document.getElementById("loadButton").style.left = "62px";
  }
} 

if (platform.os.family == "Windows XP") {
  var audioNoise = document.createElement("AUDIO");
  audioNoise.src = "assets/noise.mp3";
  audioNoise.loop = true;
  document.body.appendChild(audioNoise);
}

// Attach all the elements I need to variables.
var videoQualityControl = document.getElementById("videoQualityControl");
var audioQualityControl = document.getElementById("audioQualityControl");
var pressureVentButton = document.getElementById("pressureVent");
var peakQualityTimer = ""; 

// Add the event listener for the vent pressure button.
if (mobile === false) {
  pressureVentButton.addEventListener("mousedown", function () {
    pressureVenting = true;
    pressureVentButton.src = "assets/bigButtonPressed.png";
    setTimeout(animatePressureVentButton, 200);
  });
} else {
  pressureVentButton.addEventListener("touchstart", function () {
    pressureVenting = true;
    pressureVentButton.src = "assets/bigButtonPressed.png";
    setTimeout(animatePressureVentButton, 200);
  });
} 

// Add event listener for the load button.
document.getElementById("loadButton").addEventListener("click", load);
document.getElementById("videoUrl").addEventListener("keydown", function (e) {
  if (e.key == "Enter") {
    load();
  }
});

if (mobile === true) {
  document.getElementById("screenOverlay").addEventListener("touchstart", function (e) {
    e.target.style.zIndex = "0";
    var makeOverlayAppearTimeout = setTimeout(function (timeout) {
      e.target.style.zIndex = "4";
      clearTimeout(timeout);
    }, 3000, makeOverlayAppearTimeout);
  });
}

// Set all of the intervals for the game functions that need to run every frame (~1/30 second)
setInterval(videoQualityCheck, 33);
setInterval(audioQualityCheck, 33);
setInterval(pressureBuildup, 33); 

// Define function to check/determine the video quality.
function videoQualityCheck() {
  // Get the current rotation of the video control.
  var rotation = getRotation(videoQualityControl); 
  
  // If the user hasn't yet rotated the quality control, make sure no errors occur.
  if (isNaN(rotation)) {
    rotation = 0;
  }

  if (playing === true) {
    // If you've turned the either control crank, play a ticking sound.
    if (videoQualityControl.dataset.active == "true" || audioQualityControl.dataset.active == "true") {
      document.getElementById("tickingSound").play();
    } else {
      document.getElementById("tickingSound").pause();
    }
  } else if (playerReady === false) {
    document.getElementById("turnCrankToPlayText").innerHTML = "LOADING...";
    document.getElementById("loadingCursorContainer").style.opacity = 1;
  } else {
    document.getElementById("turnCrankToPlayText").innerHTML = "TURN THE VIDEO CRANK TO UNPAUSE VIDEO"; 
    document.getElementById("loadingCursorContainer").style.opacity = 0;
    
    // Do the following if the user has rotated the video crank.
    if (rotation != lastRotationVideo && !isNaN(rotation) && videoQualityControl.dataset.active == "true") {
      // If the user is on mobile, make it so that everything infront of the YouTube player is hidden.
      if (mobile === true || playerType == "Twitch") {
        document.getElementById("turnCrankToPlay").style.zIndex = "0";
        document.getElementById("noise").style.zIndex = "0";
        document.getElementById("player").style.zIndex = "1";
      }
      if (playerType == "Twitch") {
        document.getElementById("screenOverlay").style.zIndex = "0";
      }
      document.getElementById("turnCrankToPlay").style.opacity = 0;

      // Start the video playing
      if (playerType == "YouTube") {
        player.playVideo();
      } else {
        player.play();
      }

      playing = true; 
      
      // Make sure the record scratch-esque sound is playing
      document.getElementById("recordSound").play(); 
      
      // Finaly, make it so that the TV static on the screen can't be seen.
      document.getElementById("noise").style.opacity = 0;

      // Make sure you don't make the player's ear's bleed.
      // Thank you Zach Denton of https://noisehack.com/generate-noise-web-audio-api/ !
      if (platform.os.family == "Windows XP") {
        audioNoise.volume = 0.25;
      } else {
        audioContext = new (window.webkitAudioContext || window.AudioContext)();
        pinkNoise = audioContext.createPinkNoise();
        pinkGain = audioContext.createGain();
        pinkGain.gain.value = 0;
        pinkNoise.connect(pinkGain);
        pinkGain.connect(audioContext.destination);
        pinkGain.gain.value = 0; 
      }
    }
  } 
  
  // If the user is rotatng the video control, check for some conditions. 
  if (videoQualityControl.dataset.active == "true") {
    if (playing === true) {
      // If you've rotated the control all the way around, add 360 to the video quality
      if (rotation < lastRotationVideo - 150) {
        videoQuality += 360;
      } else if (rotation < lastRotationVideo) {
        // If you've rotated the control backwards, don't count it.
        videoQuality += lastRotationVideo - rotation;
      } else if (rotation > lastRotationVideo + 150) {
        videoQuality -= rotation - lastRotationVideo;
      }
    } else {
      // If the video hasn't started yet, make sure the user can't increase the video quality.
      videoQuality = -rotation;
    } 
    
    // Save the current rotation of the control for future reference.
    lastRotationVideo = getRotation(videoQualityControl);
  } else {
    // If the user isn't rotating the crank, give it some momentum
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
  } 
  
  // Cap the video quality to 1600.
  videoQuality = clamp(videoQuality, -rotation, 1600 - rotation); 
  
  // If the video quality isn't already 0, slowly bring it down.
  if (Math.floor(videoQuality + rotation) > 0) {
    videoQuality -= difficulty / 2;
  } 
  // Set the opacity of the video noise according to the video quality.
  // 130 = the target video quality (1300) divied by the target max blur (10px)
  // If the blur is less than 0.5px, just set it to 0.


  if (10 - (rotation + videoQuality) / 130 < 0.5) {
    document.getElementById("player").style.filter = "blur(0px)";
  } else {
    document.getElementById("player").style.filter = "blur(" + (10 - (rotation + videoQuality) / 130) + "px)";
  } 
  
  // If you've maxed out the video quality, don't rotate the dial any further.
  if (rotation + videoQuality > 1600) {
    document.getElementById("videoDial").style.transform = "rotate(" + (1600 / 6.4 - 125) + "deg)";
  } else {
    // Otherwise, rotate the dial accordingly.
    document.getElementById("videoDial").style.transform = "rotate(" + ((rotation + videoQuality) / 6.4 - 125) + "deg)";
  } 
  
  // Get the current rotation of the audio control.
  var audioQualityControlRotation = getRotation(audioQualityControl);

  if (audioQualityControlRotation < lastRotationAudio - 150) {
    audioQualityControlRotation += 360;
  } 
  
  // Finally, check if you're at peak quality.
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
      if (!((platform.os.family == "Windows XP") && (platform.version > 35 && platform.name == "Firefox"))) {
         localStorage.setItem("bestTime", peakQualityTime[1]);
      }
      bestTime = peakQualityTime[1];
      document.getElementById("bestTimeRecord").innerHTML = peakQualityTime[0];
    }
  }
} 

// Define function to check the audio quality.
function audioQualityCheck() {
  // Get the current rotation of the audio quality control.
  var rotation = getRotation(audioQualityControl); 
  
  // If the user hasn't yet rotated the quality control, make sure no errors occur.
  if (isNaN(rotation)) {
    rotation = 0;
  } 
  
  // If the user is rotatng the video control, check for some conditions. 
  if (audioQualityControl.dataset.active == "true") {
    if (playing === true) {
      // If you've rotated the control all the way around, add 360 to the audio quality
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
    // If the user isn't rotating the crank, give it some momentum
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
  audioQuality = clamp(audioQuality, -rotation, 1600 - rotation); 
  
  // If the audio quality isn't already 0, slowly bring it down.
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
  if (playerType == "YouTube") {
    player.setVolume((rotation + audioQuality) / 13 * volume);
  } else {
    player.setVolume(clamp((rotation + audioQuality) / 1300 * volume, 0, 1));
  } 
  
  // Start the audio noise playing if the user has started playing.
  if (playing === true) {
    // Get the audio noise and set it's volume accordingly.
	if (platform.os.family == "Windows XP") {
		audioNoise.play();
		audioNoise.volume = (clamp((1 - (rotation + audioQuality) / 1300) * volume, 0, 1) / 4);
	} else {
		pinkGain.gain.value = (clamp((1 - (rotation + audioQuality) / 1300) * volume, 0, 1) / 4);
	}
  } else {
    pinkGain.gain.value = 0;
  }
} 

// Get an element and return it's rotation from 0 - 360 degrees.
function getRotation(target) {
  var targetRotation = parseFloat(target.style.transform.replace(/rotate\(|deg\)/g, ""));

  if (targetRotation < 0) {
    targetRotation = Math.abs(targetRotation += 360);
  }

  if (targetRotation > 360) {
    targetRotation -= 360;
  }

  return targetRotation;
} 

// Thanks CAFxX of Stack Overflow!
// Clamp a number to [min - max] and return it.
function clamp(number, min, max) {
  return Math.max(min, Math.min(number, max));
} 

// Slowly build up pressure
function pressureBuildup() {
  // Make sure the pressure isn't below 0.
  if (pressure < 0) {
    pressure = 0;
  } 
  
  // If the user is attempting to vent pressure, decrease the pressure.
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

  if (pressure > 230) {
    // If the pressure gets too high, blow everything up and reset the pressure.
    blowUp();
  }

  if (overheating === false) {
    if (pressure >= 209) {
      overheating = true;
      document.getElementById("warningSound").play();
      document.getElementById("overheatLight").src = "assets/overheat.png";
    }
  } else if (overheating === true) {
    if (pressure < 209) {
      overheating = false;
      document.getElementById("warningSound").pause();
      document.getElementById("warningSound").currentTime = 0;
      document.getElementById("overheatLight").src = "assets/noOverheat.png";
    }
  } 
  
  // Move the pressure dial accordingly.
  document.getElementById("pressureDial").style.transform = "rotate(" + (pressure * 1.1 - 125) + "deg)";
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

function animateLoadButton(timeout) {
  document.getElementById("loadButton").src = "assets/littleButton.png";
  clearTimeout(timeout);
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
      if (!((platform.os.family == "Windows XP") && (platform.version > 35 && platform.name == "Firefox"))) {
         localStorage.setItem("difficulty", difficulty);
      }
   } else {
      if (!((platform.os.family == "Windows XP") && (platform.version > 35 && platform.name == "Firefox"))) {
         difficulty = parseFloat(localStorage.getItem("difficulty"));
      }
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
    if (!((platform.os.family == "Windows XP") && (platform.version > 35 && platform.name == "Firefox"))) {
        localStorage.setItem("volume", volume);
    }
  } else {
    if (!((platform.os.family == "Windows XP") && (platform.version > 35 && platform.name == "Firefox"))) {
        volume = parseFloat(localStorage.getItem("volume"));
    }
    if (isNaN(volume)) {
      volume = 1;
    }
  }

  document.getElementById("volumeSlider").value = volume * 100;
  document.getElementById("recordSound").volume = volume;
  document.getElementById("tickingSound").volume = volume;
  document.getElementById("ventingSound").volume = volume / 2;
  document.getElementById("warningSound").volume = volume / 2;
  document.getElementById("volumeLevel").innerHTML = "Please choose your volume level.<br>Current volume level is " + Math.round(volume * 100) + "%.";
} 

function setLoop(changed) {
  // come back and add persistence to this later.
  if (playerType !== "Twitch") {
    if (changed === "true") {
      player.setLoop(document.getElementById("loopCheckbox").checked);
      if (!((platform.os.family == "Windows XP") && (platform.version > 35 && platform.name == "Firefox"))) {
        localStorage.setItem("loop", document.getElementById("loopCheckbox").checked);
      }
    } else {
      if (!((platform.os.family == "Windows XP") && (platform.version > 35 && platform.name == "Firefox"))) {
        var value = localStorage.getItem("loop");
        if (value === "true") {
          value = true;
        } else {
          value = false;
        }
        player.setLoop(value);
        document.getElementById("loopCheckbox").checked = value;
      }
    }
  }
}

// Thank you Tom Esterez of Stack Overflow!
function formatTime(seconds) {
  var h = Math.floor(seconds / 3600);
  var m = Math.floor(seconds % 3600 / 60);
  var s = Math.round(seconds % 60);
  return [h, m > 9 ? m : h ? "0" + m : m || "0", s > 9 ? s : "0" + s].filter(Boolean).join(":");
}

function load() {
  document.getElementById("loadButton").src = "assets/littleButtonPressed.png";
  var loadButtonAnimationTimeout = setTimeout(animateLoadButton, 200, loadButtonAnimationTimeout);
  var videoUrl = document.getElementById("videoUrl").value;

  if (player) {
    player.destroy();
  }
  if (videoUrl.indexOf("twitch") != -1) {
    if (location.protocol != "file:") {
      playerType = "Twitch";
      var channelName = videoUrl.replace(/https\:\/\/|m\.|www\.|twitch\.tv\//g, "");
      var remove_after = channelName.indexOf("&");
      if (remove_after != -1) {
        channelName = channelName.substring(0, remove_after);
      }

      remove_after = channelName.indexOf("?");
      if (remove_after != -1) {
        channelName = channelName.substring(0, remove_after);
      }

      player = new Twitch.Player("player", {
        width: "100%",
        height: "100%",
        channel: channelName,
        parent: ["www.bahjeez.com", "localhost"]
      });
      player.addEventListener(Twitch.Player.READY, function () {
        player.pause();
        playerReady = true;
      });
    } else {
      alert("Because the Twitch Embed API is dumb, Twitch streams can not be embbeded if you're running Steam-Powered YouTube locally.\nPlease try playing this game off of a local server, or off of my site at www.bahjeez.com/logan/steamtube/steamtube.html");
      return;
    }
  } else if (videoUrl.indexOf("youtu") != -1) {
    playerType = "YouTube"; 

    // Stupid YouTube API won't accept normal YouTube URLs for loadVideoByUrl, so I have to do this instead.
    var videoid = videoUrl.replace(/https\:\/\/|www\.youtube\.com\/watch\?v=|youtu\.be\//g, ""); 
    
    // Thanks Leo and Samina Zahid of Stack Overflow!
    var remove_after = videoid.indexOf("&");
    if (remove_after != -1) {
      videoid = videoid.substring(0, remove_after);
    } 

    remove_after = videoid.indexOf("?");
    if (remove_after != -1) {
      videoid = videoid.substring(0, remove_after);
    } 
    
    // Load video
    player = new YT.Player("player", {
      height: "260",
      width: "450",
      videoId: videoid,
      playerVars: {
        playsinline: 1,
        controls: mobile,
        autoplay: 0,
        loop: 0,
        playlist: "Zux_GebV374",
      },
      events: {
        onReady: onYTPlayerReady
      }
    });
  } else {
    player = new videoPlayer("player", {
      height: "100%",
      width: "100%",
      controls: false,
      url: videoUrl
    });
    playerType = "Video";
  } 
  
  // Reset the "Turn video crank to unpause" screen
  document.getElementById("turnCrankToPlay").style.opacity = 1;
  document.getElementById("noise").style.opacity = 0.6; 
  
  // Reset the video and audio quality, as well as the pressure.
  var videoQualityControlRotation = getRotation(videoQualityControl);
  var audioQualityControlRotation = getRotation(audioQualityControl);
  videoQuality = -videoQualityControlRotation;
  audioQuality = -audioQualityControlRotation;
  pressure = 0;
  playing = false;
  playerReady = false;
  if (platform.os.family == "Windows XP") {
    audioNoise.pause();
  }
  document.getElementById("recordSound").pause();
  document.getElementById("screenOverlay").style.zIndex = "4";
  document.getElementById("turnCrankToPlay").style.zIndex = "3";
  document.getElementById("noise").style.zIndex = "2";
  document.getElementById("player").style.zIndex = "1";
}
document.getElementById("screenOverlay").addEventListener("mouseover", e => e.stopPropagation());
document.getElementById("screenOverlay").addEventListener("mouseenter", e => e.stopPropagation());
document.getElementById("screenOverlay").addEventListener("mouseleave", e => e.stopPropagation());