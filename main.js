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
*/

// Define all the global variables I need.

lastRotationVideo = 0;
lastRotationAudio = 0;
videoQuality = 0;
audioQuality = 0;
pressure = 0;
pressureVenting = false;
overheating = false;
peakQuality = false;

// Attach all the elements I need to variables.
videoQualityControl = document.getElementById("videoQualityControl");
audioQualityControl = document.getElementById("audioQualityControl");

// Start the function that builds up pressure
pressureBuildup();

// Add event listeners for the vent pressure button.
document.getElementById("pressureVent").addEventListener("mousedown", function() {
  pressureVenting = true;
})
document.getElementById("pressureVent").addEventListener("mouseup", function() {
  pressureVenting = false;
})

// Add event listener for the load button.
document.getElementById("loadButton").addEventListener("click", function(){
    document.getElementById("noise").style.zIndex = "2"
    // Stupid YouTube API won't accept normal YouTube URLs for loadVideoByUrl, so I have to do this instead.
    
    var videoid = document.getElementById("videoUrl").value.replace(/https\:\/\/|www.youtube.com\/watch\?v=|www.youtu.be\//g, "")
    
    // Thanks Leo and Samina Zahid of Stack Overflow!
    var remove_after = videoid.indexOf("&");
    if (remove_after != -1) {
        videoid = videoid.substring(0, remove_after);
    }
    
    // Load video
    player.loadVideoById({videoId: videoid});
    
    // Reset audio and video quality
    videoQuality = 0;
    audioQuality = 0;
    })

// Start function to check the video quality.
videoQualityCheck();

// Define function to check the video quality.
function videoQualityCheck() {
  // Check the video quality again in ~1/30 secs.
	var videoQualityCheckTimeout = setTimeout(videoQualityCheck, 33)

  // Make sure the record scratch-esque sound is playing
  document.getElementById("recordSound").play();
	
	// Get the current rotation of the video control.
  var rotation = getRotation(videoQualityControl);

  // Get the current rotation of the audio control.
  var audioQualityControlRotation = getRotation(audioQualityControl);

  // If you've turned the control wheel, play a ticking sound.
  if ((rotation != lastRotationVideo) || (audioQualityControlRotation != lastRotationAudio)) {
    document.getElementById("tickingSound").play();
  } else {
    document.getElementById("tickingSound").pause();
  }
  
  // If you've rotated the control all the way around, add 360 to the rotation in the future.
  if (rotation < (lastRotationVideo - 300)) {
      if (videoQualityControl.dataset.active == "true") {
          videoQuality += 360;
      }
  }
  
  // If you've rotated the control backwards, don't count it.
  if (rotation > (lastRotationVideo + 300)) {
      rotation -= rotation;
  }
  
  // Save the current rotation of the control for future reference.
  lastRotationVideo = getRotation(videoQualityControl);
  
  // Cap the video quality to 3200.
  if (videoQuality > 3200) {
      videoQuality = 3200;
  }
  
  // If the video quality isn't already 0, slowly bring it down.
  if (videoQuality > 0) {
      videoQuality -= ((1.0008 ** videoQuality) + 2)/1.5;
  }
  
  // Set the opacity of the video noise according to the video quality.
  document.getElementById("noise").style.opacity = (1 -((rotation + videoQuality) / 2600));
  
  // If you've maxed out the video quality, don't rotate the dial any further.
  if ((rotation + videoQuality) > 3200) {
    document.getElementById("videoDial").style.transform = "rotate(" + ((3200 / 13) - 120) + "deg)";
  } else {
    // Otherwise, rotate the dial accordingly.
    document.getElementById("videoDial").style.transform = "rotate(" + (((rotation + videoQuality) / 13) - 120) + "deg)";
  }

  // Finally, check if you're at peak quality.
  if (peakQuality === false) {
    if (((videoQuality + rotation) >= 2600) && ((audioQuality + audioQualityControlRotation) >= 2600)) {
      peakQuality = true;
      document.getElementById("peakQualityLight").src = "assets/peakQuality.png"
      document.getElementById("peakQualityLight").style.width = "162px"
    }
  } else if (peakQuality === true) {
    if (((videoQuality + rotation) < 2600) && ((audioQuality + audioQualityControlRotation) < 2600)) {
      peakQuality = false;
      document.getElementById("peakQualityLight").src = "assets/notPeakQuality.png"
      document.getElementById("peakQualityLight").style.width = "168px"
    }
  }
  
}

// Start the function to check the audio quality.
audioQualityCheck();

// Define function to check the audio quality.
function audioQualityCheck() {
  
  // Check the audio quality again in ~1/30 secs.
	var audioQualityCheckTimeout = setTimeout(audioQualityCheck, 33)
	
	// Get the current rotation of the audio quality control.
  var rotation = getRotation(audioQualityControl);
  
  // If you've rotated the control all the way around, add 360 to the rotation in the future.
  if (rotation < (lastRotationAudio - 300)) {
      if (audioQualityControl.dataset.active == "true") {
          audioQuality += 360;
      }
  }
  
  // If you've rotated the control backwards, don't count it.
  if (rotation > (lastRotationAudio + 300)) {
      rotation -= rotation;
  }
  
  // Save the current rotation of the control for future reference.
  lastRotationAudio = getRotation(audioQualityControl);
  
  // Cap the audio quality to 3000.
  if (audioQuality > 3200) {
      audioQuality = 3200;
  }
  
  // If the audio quality isn't already 0, slowly bring it down.
  if (audioQuality > 0) {
      audioQuality -= ((1.0008 ** audioQuality) + 2)/1.5;
  }
  
  // If you've maxed out the video quality, don't rotate the dial any further.
  if ((rotation + audioQuality) > 3200) {
    document.getElementById("audioDial").style.transform = "rotate(" + ((3200 / 13) - 120) + "deg)";
  } else {
    // Otherwise, rotate the dial accordingly.
    document.getElementById("audioDial").style.transform = "rotate(" + (((rotation + audioQuality) / 13) - 120) + "deg)";
  }
  
  // Get the embedded YouTube player and tell it to change the volume accordingly.
  player.setVolume(((rotation + audioQuality)/26));
  document.getElementById("audioNoise").play();
  
  // Get the audio noise and set it's volume accordingly.
  document.getElementById("audioNoise").volume = (clamp((1 - ((rotation + audioQuality)/2600)), 0, 1) / 4)
}

// Get an element and return it's rotation from 0 - 360 degrees
function getRotation(target) {
    targetRotation = parseInt(target.style.transform.replace(/rotate\(|deg\)/g, ""));
    if (targetRotation < 0) {
        targetRotation = Math.abs(targetRotation += 360);
    }
    if (targetRotation > 360) {
        targetRotation -= 360
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
  // Increase the pressure again in ~1/30 secs.
  var pressureTimeout = setTimeout(pressureBuildup, 33);
  
  // If the user is attempting to vent pressure, decrease the pressure.
  if (pressureVenting === true) {
    if (pressure > 0) {
      pressure -= 2;
      document.getElementById("ventingSound").play();
    }
  } else {
    // Otherwise, keep increasing it.
    pressure += 0.25;
    document.getElementById("ventingSound").pause();
  }
  if (pressure > 220) {
    // If the pressure gets too high, blow everything up and reset the pressure.
    blowUp();
    pressure = 0;
  }
  if (overheating === false) {
    if (pressure >= 180) {
      overheating = true;
      document.getElementById("overheatLight").src = "assets/overheat.png"
    }
  } else if (overheating === true) {
    if (pressure < 180) {
      overheating = false;
      document.getElementById("overheatLight").src = "assets/noOverheat.png"
    }
  }
  // Set the pressure dial accordingly.
  document.getElementById("pressureDial").style.transform = "rotate(" + (pressure * 1.1 - 120) + "deg)";
}
function blowUp() {
  // If the pressure gets too high, cause everything to explode.
  alert("You failed!");
  
  // Reset everything.
  videoQuality = 0;
  audioQuality = 0;
  
  // The current state of the function is a placeholder for a real explosion
}