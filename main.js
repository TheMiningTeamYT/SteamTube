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
*/
// Create the timer object I'm going to use to keep track of time elapsed.
class timer {
  constructor() {
      this.startDate = new Date();
  }
  timeElapsed() {
      // Thank you JellicleCat of Stack Overflow!
      var seconds= Math.round(((new Date()) - this.startDate) / 1000);
      var timeStr = formatTime(seconds);
      return [timeStr, seconds];
  }
}
// Define all the global variables I need.
var testTimer = new timer();
lastRotationVideo = 0;
lastRotationAudio = 0;
videoQuality = 0;
audioQuality = 0;
pressure = 0;
playing = false;
pressureVenting = false;
overheating = false;
peakQuality = false;
playerReady = false;
bestTime = parseFloat(localStorage.getItem("bestTime"));
if (isNaN(bestTime)) {
  bestTime = 0;
} else {
  document.getElementById("bestTimeRecord").innerText = formatTime(bestTime);
}
// Attach all the elements I need to variables.
videoQualityControl = document.getElementById("videoQualityControl");
audioQualityControl = document.getElementById("audioQualityControl");
pressureVentButton = document.getElementById("pressureVent");
// Get the difficulty
setDifficulty("false");
// Make sure you don't make the player's ear's bleed.
document.getElementById("audioNoise").volume = 0.25;
// Add event listeners for the vent pressure button.
pressureVentButton.addEventListener("click", function() {
  pressureVenting = true;
  pressureVentButton.src = "assets/bigButtonPressed.png";
  setTimeout(animatePressureVentButton, 200);
});

// Add event listener for the load button.
document.getElementById("loadButton").addEventListener("click", function(){
  document.getElementById("loadButton").src = "assets/littleButtonPressed.png";
  var loadButtonAnimationTimeout = setTimeout(animateLoadButton, 200);
  // Stupid YouTube API won't accept normal YouTube URLs for loadVideoByUrl, so I have to do this instead.
  var videoid = document.getElementById("videoUrl").value.replace(/https\:\/\/|www.youtube.com\/watch\?v=|www.youtu.be\//g, "");
  // Thanks Leo and Samina Zahid of Stack Overflow!
  var remove_after = videoid.indexOf("&");
  if (remove_after != -1) {
      videoid = videoid.substring(0, remove_after);
  }
  // Load video
  player.cueVideoById({videoId: videoid});
  // Reset the "Turn crank to play video" screen
  document.getElementById("turnCrankToPlay").style.opacity = 1;
  document.getElementById("noise").style.opacity = 0.6;
  // Reset audio and video quality
  var videoQualityControlRotation = getRotation(videoQualityControl);
  var audioQualityControlRotation = getRotation(audioQualityControl);
  videoQuality = -videoQualityControlRotation;
  audioQuality = -audioQualityControlRotation;
  pressure = 0;
  playing = false;
  playerReady = false;
});
// Set all of the intervals
setInterval(videoQualityCheck, 33);
setInterval(audioQualityCheck, 33);
setInterval(pressureBuildup, 33);

// Define function to check the video quality.
function videoQualityCheck() {
	// Get the current rotation of the video control.
  var rotation = getRotation(videoQualityControl);
  // If the user hasn't yet rotated the quality control, make sure no errors occur.
  if (isNaN(rotation)) {
    rotation = 0;
  }
  if (playing === true) {
    // If you've turned the control wheel, play a ticking sound.
    if ((videoQualityControl.dataset.active == "true") || (audioQualityControl.dataset.active  == "true")) {
      document.getElementById("tickingSound").play();
    } else {
      document.getElementById("tickingSound").pause();
    }
  } else if (playerReady === false) {
    document.getElementById("turnCrankToPlayText").innerText = "LOADING...";
  } else {
    document.getElementById("turnCrankToPlayText").innerText = "TURN THE VIDEO CRANK TO UNPAUSE VIDEO";
    if ((rotation != lastRotationVideo) && (!isNaN(rotation)) && (videoQualityControl.dataset.active == "true")) {
      // Start the video playing
      document.getElementById("turnCrankToPlay").style.opacity = 0;
      player.playVideo();
      playing = true;
      // Make sure the record scratch-esque sound is playing
      document.getElementById("recordSound").play();
      // Finaly, remove the noise
      document.getElementById("noise").style.opacity = 0;
    }
  }
  // If you've rotated the control all the way around, add 360 to the rotation in the future.
  if (videoQualityControl.dataset.active == "true") {
    if ((rotation < (lastRotationVideo - 150))) {
      videoQuality += 360;
    } else if (rotation < lastRotationVideo) {
      // If you've rotated the control backwards, don't count it.
      videoQuality += (lastRotationVideo - rotation);
    } else if ((rotation > (lastRotationVideo + 150))) {
      videoQuality -= (rotation - lastRotationVideo);
    }
    // Save the current rotation of the control for future reference.
    lastRotationVideo = getRotation(videoQualityControl);
  } else {
    // Give the wheel some momentum
    var previousRotation = rotation;
    if (rotation < (lastRotationVideo - 150)) {
      videoQuality += 360;
      rotation += (((rotation + 360) - lastRotationVideo) / 1.3);
    } else if (rotation > (lastRotationVideo + 150)) {
      videoQuality -= (rotation - lastRotationVideo);
      rotation += (((rotation - 360) - lastRotationVideo) / 1.3);
    } else if (rotation < lastRotationVideo) {
      videoQuality += (lastRotationVideo - rotation);
      rotation += ((rotation - lastRotationVideo) / 1.3);
    } else {
      rotation += ((rotation - lastRotationVideo) / 1.3);
    }
    lastRotationVideo = previousRotation;
    videoQualityControl.style.transform = "rotate(" + rotation + "deg)";
    var dropShadow = getRotationPoint(20, 20, (rotation));
    videoQualityControl.style.filter = "drop-shadow(" + dropShadow[0] + "px " + dropShadow[1] + "px 3px rgba(0,0,0,0.7)";
    videoQualityControl.dataset.angle = rotation;
  }
  // Cap the video quality to 1600.
  videoQuality = clamp(videoQuality, -rotation, (1600 - rotation));
  // If the video quality isn't already 0, slowly bring it down.
  if (Math.floor((videoQuality + rotation)) > 0) {
      videoQuality -= (difficulty / 2);
  }
  // Set the opacity of the video noise according to the video quality.
  // 520 = the target video quality (1300) divied by the target max blur (10px)
  if ((10 - ((rotation + videoQuality) / 130)) < 0.5) {
    document.getElementById("player").style.filter = "blur(0px)";
  } else {
    document.getElementById("player").style.filter = "blur(" + (10 - ((rotation + videoQuality) / 130)) + "px)";
  }
  // If you've maxed out the video quality, don't rotate the dial any further.
  if ((rotation + videoQuality) > 1600) {
    document.getElementById("videoDial").style.transform = "rotate(" + ((1600 / 6.4) - 125) + "deg)";
  } else {
    // Otherwise, rotate the dial accordingly.
    document.getElementById("videoDial").style.transform = "rotate(" + (((rotation + videoQuality) / 6.4) - 125) + "deg)";
  }
  // Get the current rotation of the audio control.
  var audioQualityControlRotation = getRotation(audioQualityControl);
  if (audioQualityControlRotation < (lastRotationAudio - 150)) {
    audioQualityControlRotation += 360;
  }
  // Finally, check if you're at peak quality.
  if ((peakQuality === false) && (((videoQuality + rotation) >= 1325) && ((audioQuality + audioQualityControlRotation) >= 1300))) {
    peakQuality = true;
    peakQualityTimer = new timer();
    document.getElementById("peakQualityLight").src = "assets/peakQuality.png";
    document.getElementById("bestTimeDiv").style.backgroundImage = "url('assets/bestTime.png')";
  } else if ((peakQuality === true) && (((videoQuality + rotation) < 1325) || ((audioQuality + audioQualityControlRotation) < 1300))) {
    peakQuality = false;
    document.getElementById("peakQualityLight").src = "assets/notPeakQuality.png";
    document.getElementById("bestTimeDiv").style.backgroundImage = "url('assets/notBestTime.png')";
    document.getElementById("bestTimeText").innerText = "0:00";
  } else if (peakQuality === true) {
    var peakQualityTime = peakQualityTimer.timeElapsed();
    document.getElementById("bestTimeText").innerText = peakQualityTime[0];
    if (peakQualityTime[1] > bestTime) {
      localStorage.setItem("bestTime", peakQualityTime[1]);
      bestTime = peakQualityTime[1]
      document.getElementById("bestTimeRecord").innerText = formatTime(bestTime);
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
  // If you've rotated the control all the way around, add 360 to the rotation in the future.
  if (audioQualityControl.dataset.active == "true") {
    if (rotation < (lastRotationAudio - 150)) {
      audioQuality += 360;
    } else if (rotation < lastRotationAudio) {
      // If you've rotated the control backwards, don't count it.
      audioQuality += (lastRotationAudio - rotation);
    } else if (rotation > (lastRotationAudio + 150)) {
      audioQuality -= (rotation - lastRotationAudio);
    }
    // Save the current rotation of the control for future reference.
    lastRotationAudio = getRotation(audioQualityControl);
  } else {
    // If the user isn't actively rotating the control, give the wheel some momentum.
    var previousRotation = rotation;
    if (rotation < (lastRotationAudio - 150)) {
      audioQuality += 360;
      rotation += (((rotation + 360) - lastRotationAudio) / 1.3);
    } else if (rotation > (lastRotationAudio + 150)) {
      audioQuality -= (rotation - lastRotationAudio);
      rotation += (((rotation - 360) - lastRotationAudio) / 1.3);
    } else if (rotation < lastRotationAudio) {
      // If you've rotated the control backwards, don't count it.
      audioQuality += (lastRotationAudio - rotation);
      rotation += ((rotation - lastRotationAudio) / 1.3);
    } else {
      rotation += ((rotation - lastRotationAudio) / 1.3);
    }
    lastRotationAudio = previousRotation;
    audioQualityControl.style.transform = "rotate(" + rotation + "deg)";
    var dropShadow = getRotationPoint(20, 20, (rotation));
    audioQualityControl.style.filter = "drop-shadow(" + dropShadow[0] + "px " + dropShadow[1] + "px 3px rgba(0,0,0,0.7)"
    audioQualityControl.dataset.angle = rotation;
  }
  // Cap the audio quality to 1600.
  audioQuality = clamp(audioQuality, -rotation, (1600 - rotation));
  // If the audio quality isn't already 0, slowly bring it down.
  if (Math.floor((audioQuality + rotation)) > 0) {
      audioQuality -= (difficulty / 2);
  }
  // If you've maxed out the video quality, don't rotate the dial any further.
  if ((rotation + audioQuality) > 1600) {
    document.getElementById("audioDial").style.transform = "rotate(" + ((1600 / 6.3) - 122) + "deg)";
  } else {
    // Otherwise, rotate the dial accordingly.
    document.getElementById("audioDial").style.transform = "rotate(" + (((rotation + audioQuality) / 6.3) - 122) + "deg)";
  }
  // Get the embedded YouTube player and tell it to change the volume accordingly.
  player.setVolume(((rotation + audioQuality)/13));
  // Start the audio noise playing if the user has started playing.
  if (playing === true) {
    document.getElementById("audioNoise").play();
  }
  // Get the audio noise and set it's volume accordingly.
  document.getElementById("audioNoise").volume = (clamp((1 - ((rotation + audioQuality)/1300)), 0, 1) / 4);
}
// Get an element and return it's rotation from 0 - 360 degrees
function getRotation(target) {
    targetRotation = parseFloat(target.style.transform.replace(/rotate\(|deg\)/g, ""));
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
  } else {
    // Otherwise, keep increasing it.
    pressure += (0.25 * (difficulty / 6));
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
  }
  // Set the pressure dial accordingly.
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
  var x = rh * (Math.sin((angle * Math.PI) / 180));
  var y = ry * (Math.cos((angle * Math.PI) / 180));
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
      difficulty = 6
    }
    document.getElementById("difficultySlider").value = difficulty;
  }
}
// Thank you Tom Esterez of Stack Overflow!
function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.round(seconds % 60);
  return [
    h,
    m > 9 ? m : (h ? '0' + m : m || '0'),
    s > 9 ? s : '0' + s
  ].filter(Boolean).join(':');
}