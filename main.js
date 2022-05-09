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
*/

// Define all the global variables I need.

lastRotationVideo = 0;
lastRotationAudio = 0;
videoQuality = 0;
audioQuality = 0;
pressure = 0;
playing = false;
pressureVenting = false;
overheating = false;
peakQuality = false;
// Attach all the elements I need to variables.
videoQualityControl = document.getElementById("videoQualityControl");
audioQualityControl = document.getElementById("audioQualityControl");
pressureVentButton = document.getElementById("pressureVent");
// Make sure you don't make the player's ear's bleed.
document.getElementById("audioNoise").volume = 0.25;
// Add event listeners for the vent pressure button.
pressureVentButton.addEventListener("click", function() {
  pressureVenting = true;
  pressureVentButton.src = "assets/bigButtonPressed.png";
  setTimeout(animatePressureVentButton, 200);
})

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
  player.loadVideoById({videoId: videoid});
  // Reset the "Turn crank to play video" screen
  document.getElementById("turnCrankToPlay").style.opacity = 1;
  // Reset audio and video quality
  videoQuality = 0;
  audioQuality = 0;
  pressure = 0;
  playing = false;
})
// Set all of the intervals
setInterval(videoQualityCheck, 33);
setInterval(audioQualityCheck, 33);
setInterval(pressureBuildup, 33);

// Define function to check the video quality.
function videoQualityCheck() {
	// Get the current rotation of the video control.
  var rotation = getRotation(videoQualityControl);
  // Get the current rotation of the audio control.
  var audioQualityControlRotation = getRotation(audioQualityControl);
  // If you've turned the control wheel, play a ticking sound.
  if (((rotation != lastRotationVideo) || (audioQualityControlRotation != lastRotationAudio)) && (playing === true)) {
    document.getElementById("tickingSound").play();
  } else {
    document.getElementById("tickingSound").pause();
  }
  // If you've rotated the control all the way around, add 360 to the rotation in the future.
  if ((rotation < (lastRotationVideo - 150)) && (videoQualityControl.dataset.active == "true")) {
    videoQuality += 360;
  } else if (rotation < lastRotationVideo) {
    // If you've rotated the control backwards, don't count it.
    videoQuality += (lastRotationVideo - rotation);
  } else if ((rotation > (lastRotationVideo + 150)) && (videoQualityControl.dataset.active == "true")) {
    videoQuality -= rotation;
  }
  // Start the video playing
  if ((playing === false) && (rotation != lastRotationVideo) && (!isNaN(rotation))) {
    document.getElementById("turnCrankToPlay").style.opacity = 0;
    player.playVideo();
    playing = true;
    // Make sure the record scratch-esque sound is playing
    document.getElementById("recordSound").play();
    // Finaly, remove the noise
    document.getElementById("noise").style.opacity = 0;
  }
  // Save the current rotation of the control for future reference.
  lastRotationVideo = getRotation(videoQualityControl);
  // Cap the video quality to 3200.
  // If the user hasn't yet rotated the quality control, make sure no errors occur.
  if (isNaN(rotation)) {
    rotation = 0;
  }
  videoQuality = clamp(videoQuality, -rotation, (3200 - rotation));
  // If the video quality isn't already 0, slowly bring it down.
  if ((videoQuality + rotation) > 0) {
      videoQuality -= (Math.pow(1.0009, videoQuality) + 2)/2;
  }
  // Set the opacity of the video noise according to the video quality.
  // 520 = the target video quality (2600) divied by the target max blur (10px)
  document.getElementById("player").style.filter = "blur(" + (10 -((rotation + videoQuality) / 260)) + "px)";
  // If you've maxed out the video quality, don't rotate the dial any further.
  if ((rotation + videoQuality) > 3200) {
    document.getElementById("videoDial").style.transform = "rotate(" + ((3200 / 12.8) - 125) + "deg)";
  } else {
    // Otherwise, rotate the dial accordingly.
    document.getElementById("videoDial").style.transform = "rotate(" + (((rotation + videoQuality) / 12.8) - 125) + "deg)";
  }
  // Finally, check if you're at peak quality.
  if ((peakQuality === false) && (((videoQuality + rotation) >= 2650) && ((audioQuality + audioQualityControlRotation) >= 2600))) {
    peakQuality = true;
    document.getElementById("peakQualityLight").src = "assets/peakQuality.png"
  } else if ((peakQuality === true) && (((videoQuality + rotation) < 2650) || ((audioQuality + audioQualityControlRotation) < 2600))) {
    peakQuality = false;
    document.getElementById("peakQualityLight").src = "assets/notPeakQuality.png"
  }
  
}
// Define function to check the audio quality.
function audioQualityCheck() {
	// Get the current rotation of the audio quality control.
  var rotation = getRotation(audioQualityControl);
  // If you've rotated the control all the way around, add 360 to the rotation in the future.
  if ((rotation < (lastRotationAudio - 150)) && (audioQualityControl.dataset.active == "true")) {
    audioQuality += 360;
  } else if (rotation < lastRotationAudio) {
    // If you've rotated the control backwards, don't count it.
    audioQuality += (lastRotationAudio- rotation);
  } else if ((rotation > (lastRotationAudio + 150)) && (audioQualityControl.dataset.active == "true")) {
    audioQuality -= 360;
  }
  // Save the current rotation of the control for future reference.
  lastRotationAudio = getRotation(audioQualityControl);
  // If the user hasn't yet rotated the quality control, make sure no errors occur.
  if (isNaN(rotation)) {
    rotation = 0;
  }
  // Cap the audio quality to 3200.
  audioQuality = clamp(audioQuality, -rotation, (3200 - rotation));
  // If the audio quality isn't already 0, slowly bring it down.
  if ((audioQuality + rotation) > 0) {
      audioQuality -= (Math.pow(1.0009, audioQuality) + 2)/2;
  }
  // If you've maxed out the video quality, don't rotate the dial any further.
  if ((rotation + audioQuality) > 3200) {
    document.getElementById("audioDial").style.transform = "rotate(" + ((3200 / 12.6) - 122) + "deg)";
  } else {
    // Otherwise, rotate the dial accordingly.
    document.getElementById("audioDial").style.transform = "rotate(" + (((rotation + audioQuality) / 12.6) - 122) + "deg)";
  }
  // Get the embedded YouTube player and tell it to change the volume accordingly.
  player.setVolume(((rotation + audioQuality)/26));
  if (playing === true) {
    document.getElementById("audioNoise").play();
  }
  // Get the audio noise and set it's volume accordingly.
  document.getElementById("audioNoise").volume = (clamp((1 - ((rotation + audioQuality)/2600)), 0, 1) / 4);
}
// Get an element and return it's rotation from 0 - 360 degrees
function getRotation(target) {
    targetRotation = parseInt(target.style.transform.replace(/rotate\(|deg\)/g, ""));
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
    pressure += 0.25;
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
  videoQuality = 0;
  audioQuality = 0;
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