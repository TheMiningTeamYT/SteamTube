// Thank you Tom Esterez of Stack Overflow!
function formatTime(seconds) {
    var h = Math.floor(seconds / 3600);
    var m = Math.floor(seconds % 3600 / 60);
    var s = Math.round(seconds % 60);
    return [h, m > 9 ? m : h ? "0" + m : m || "0", s > 9 ? s : "0" + s].filter(Boolean).join(":");
}

// Create the timer object I'm going to use to keep track of time elapsed.
function Timer() {
    this.startDate = new Date();
}

Timer.prototype.timeElapsed = function() {
    // Thank you JellicleCat of Stack Overflow!
    var seconds = Math.round((new Date() - this.startDate) / 1000);
    var timeStr = formatTime(seconds);
    return [timeStr, seconds];
}

// The videoPlayer class is to provide a more convenient way to interact with the HTML <video> element 
// for embedding video files, as well as to add needed functions for this use case 
// (destroy(), and the ability to embed the <video> element inside a specific div).

function VideoPlayer(parent, options) {
    this.videoElement = document.createElement("video");
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
    parent.appendChild(this.videoElement);
}

VideoPlayer.prototype.play = function() {
    if (this.videoElement.paused) {
        this.videoElement.play();
    }
}

VideoPlayer.prototype.pause = function() {
    if (!this.videoElement.paused) {
        this.videoElement.pause();
    }
}

VideoPlayer.prototype.setVolume = function(volume) {
    this.videoElement.volume = volume;
}

VideoPlayer.prototype.destroy = function() {
    this.videoElement.remove();
}

VideoPlayer.prototype.setLoop = function(loop) {
    this.videoElement.loop = loop;
}

var videoQualityControl = new QualityControl(document.getElementById("videoQualityControl"), videoQualityCheck);
var audioQualityControl = new QualityControl(document.getElementById("audioQualityControl"), audioQualityCheck);

// Bind frequently used elements to variables.
var audioQualityDial = document.getElementById("audioDial");
var videoQualityDial = document.getElementById("videoDial");
var pressureDial = document.getElementById("pressureDial");
var audioNoise = document.getElementById("audioNoise");
var tickingSound = document.getElementById("tickingSound");
var recordSound = document.getElementById("recordSound");
var warningSound = document.getElementById("warningSound");
var ventingSound = document.getElementById("ventingSound");
var videoNoise = document.getElementById("noise");
var crankText = document.getElementById("turnCrankToPlayText");
var crankTextContainer = document.getElementById("turnCrankToPlay");
var loadingCursor = document.getElementById("loadingCursorContainer");
var legacyAudio = false;
var audioContext;
var pinkNoise;
var pinkGain;

var videoQuality = 0;
var audioQuality = 0;
// If you're an end user, no touchy!!
var vQualThres = 0.835;
var aQualThres = 0.8;
var cheater = false;
var pressure = 0;
var playing = false;
var pressureVenting = false;
var ventingDueToOverheat = false;
var overheating = false;
var peakQuality = false;
var playerReady = false;
var playerType = "YouTube";
var mobile = false;
var bestTime = parseFloat(localStorage.getItem("bestTime"));
// Define global var difficulty first so that it can be used by setDifficulty
var difficulty = 6;  
// Define global var volume first so that it can be used by setVolume
var volume = 1;
// Prevent flickering of the unpause screen
var debounce = performance.now();
var lastPressureFrame = performance.now();
var nextPressureFrame = 0;

function videoQualityCheck(obj, time) {
    if (playing) {
        if (videoQuality === 0) {
            // Pause the video.
            if (playerType === "YouTube") {
                player.pauseVideo();
            } else {
                player.pause();
            }
            playing = false;
            // TODO: All the other things that should happen when the video stops.
        }
    } else if (playerReady) {
        if (obj.rotation > obj.lastRotation2 && obj.active) {
            crankTextContainer.style.opacity = 0;

            // Start the video playing
            if (playerType === "YouTube") {
                player.playVideo();
            } else {
                player.play();
            }
            debounce = performance.now() + 1000;

            // Make sure you don't make the user's ears bleed.
            if (legacyAudio) {
                audioNoise.volume = 0.25;
            } else {
                pinkGain.gain.value = 0.25;
                audioContext.resume();
            }
            playing = true;
        }
    }

    // Handle if the user is rotating the video control.
    if (obj.active) {
        if (playing && obj.rotation > obj.lastRotation2) {
            if (difficulty > 6) {
                videoQuality += (obj.rotation - obj.lastRotation2)*0.0325*(difficulty/1.5)*(2 - videoQuality)/(Math.PI*3);
            } else {
                videoQuality += (obj.rotation - obj.lastRotation2)*0.075*(2 - videoQuality)/(Math.PI);
            }
        }
    } else {
        // If the user isn't rotating the video control give it some momentum;
        if (obj.angularVelocity > 0 && playing) {
            if (difficulty > 6) {
                videoQuality += obj.angularVelocity*time*0.0325*(difficulty/1.5)*(2 - videoQuality)/(Math.PI*3);
            } else {
                videoQuality += obj.angularVelocity*time*0.075*(2 - videoQuality)/(Math.PI);
            }
        }
        obj.rotation += obj.angularVelocity*time;
        obj.angularVelocity /= 1.3;
    }

    var decrease = (playing) ? (difficulty/1.5)*time*(2-videoQuality*1.5)/40000 : (difficulty/1.5)*time*(2-videoQuality*1.5)/160000
    if (ventingDueToOverheat) {
        decrease *= 5;
    }
    if (videoQuality >= decrease) {
        videoQuality -= decrease;
    } else {
        videoQuality = 0;
    }
    if (videoQuality > 1) {
        videoQuality = 1;
    } 

    // Set the opacity of the video noise according to the video quality.
    if (1 - videoQuality/vQualThres < 0.05) {
        document.getElementById("player").style.filter = "blur(0px) brightness(1)";
        videoNoise.style.opacity = 0;
    } else {
        document.getElementById("player").style.filter = "blur(" + ((1 - videoQuality/vQualThres) * 10) + "px) brightness(" + (0.5 + videoQuality/1.67) + ")";
        videoNoise.style.opacity = (1 - videoQuality)/2;
    }

    // Move the dial according to the video quality.
    videoQualityDial.style.transform = "rotate(" + (250*videoQuality - 125) + "deg)";
}

function audioQualityCheck(obj, time) {
    // Handle if the user is rotating the video control.
    if (obj.active) {
        if (playing && obj.rotation > obj.lastRotation2) {
            if (difficulty > 6) {
                audioQuality += (obj.rotation - obj.lastRotation2)*0.0325*difficulty*(2 - audioQuality)/(Math.PI*3);
            } else {
                audioQuality += (obj.rotation - obj.lastRotation2)*0.075*(2 - audioQuality)/(Math.PI);
            }
        }
    } else {
        // If the user isn't rotating the video control give it some momentum;
        if (obj.angularVelocity > 0 && playing) {
            if (difficulty > 6) {
                audioQuality += obj.angularVelocity*time*0.0325*(difficulty/1.5)*(2 - audioQuality)/(Math.PI*3);
            } else {
                audioQuality += obj.angularVelocity*time*0.075*(2 - audioQuality)/(Math.PI);
            }
        }
        obj.rotation += obj.angularVelocity*time;
        obj.angularVelocity /= 1.3;
    }

    var decrease = (playing) ? (difficulty/1.5)*time*(2-audioQuality*1.5)/40000 : (difficulty/1.5)*time*(2-audioQuality*1.5)/160000
    if (ventingDueToOverheat) {
        decrease *= 5;
    }
    if (audioQuality >= decrease) {
        audioQuality -= decrease;
    } else {
        audioQuality = 0;
    }
    if (audioQuality > 1) {
        audioQuality = 1;
    }

    audioQualityDial.style.transform = "rotate(" + (260*audioQuality - 125) + "deg)";

    if (playing) {
        // Get the volume of the video player.
        if (playerType === "YouTube") {
            player.setVolume(audioQuality*volume*100/aQualThres);
        } else {
            player.setVolume(audioQuality*volume/aQualThres);
        }

        // Get the audio noise and set its volume accordingly.
        if (audioQuality*0.25/aQualThres < 0.25) {
            if (legacyAudio) {
                audioNoise.volume = 0.25 - audioQuality*0.25/aQualThres;
                if (audioNoise.paused) {
                    audioNoise.play();
                }
            } else {
                pinkGain.gain.value = 0.25 - audioQuality*0.25/aQualThres;
            }
        } else {
            if (legacyAudio) {
                audioNoise.volume = 0;
                if (!audioNoise.paused) {
                    audioNoise.pause();
                }
            } else {
                pinkGain.gain.value = 0;
            }
        }
    } else {
        if (legacyAudio) {
            if (!audioNoise.paused) {
                audioNoise.pause();
            }
        } else {
            pinkGain.gain.value = 0;
        }
    }
}

function ventPressed() {
    pressureVenting = true;
    ventingSound.currentTime = 5 - pressure*5;
    document.getElementById("pressureVent").src = "assets/bigButtonPressed.png";
}

function ventReleased() {
    document.getElementById("pressureVent").src = "assets/bigButton.png"
}

function pressureTask(now) {
    // Only run at 30 FPS.
    if (now >= nextPressureFrame) {
        var time = now - lastPressureFrame;
        // Make sure the pressure doesn't go below 0.
        if (pressure < 0) {
            pressure = 0;
        }
        // If the user is attempting to vent pressure, decrease the pressure.
        if (pressureVenting) {
            if (pressure >= 0.0002*time) {
                pressure -= 0.0002*time;
                if (ventingSound.paused) {
                    ventingSound.play();
                }
                if (ventingDueToOverheat) {
                    document.getElementById("overheatLight").src = "assets/overheat.png";
                }
            } else {
                pressure = 0;
                pressureVenting = false;
                ventingDueToOverheat = false;
                if (!ventingSound.paused) {
                    ventingSound.pause();
                    ventingSound.currentTime = 0;
                }
                document.getElementById("overheatLight").src = "assets/noOverheat.png";
            }
        } else if (playing) {
            // Otherwise, keep increasing the pressure.
            pressure += 0.000047283*time*(difficulty/6);
        } else {
            if (pressure >= 0.000015761*time) {
                pressure -= 0.000015761*time;
            }
        }

        if (pressure >= 1) {
            // If the pressure gets too high, blow up.
            // TODO: Have the dials fall over time once it explodes.
            pressureVenting = true;
            ventingDueToOverheat = true;
        } else if (overheating) {
            if (pressure < 0.908695652) {
                overheating = false;
                warningSound.pause();
                warningSound.currentTime = 0;
                if (!ventingDueToOverheat) {
                    document.getElementById("overheatLight").src = "assets/noOverheat.png";
                }
            }
        } else {
            if (pressure >= 0.908695652) {
                overheating = true;
                warningSound.play();
                document.getElementById("overheatLight").src = "assets/overheat.png";
            }
        }

        // Move the pressure dial accordingly.
        pressureDial.style.transform = "rotate(" + (253*pressure - 125) + "deg)";
        lastPressureFrame = now;
        if (now - nextPressureFrame < 500/30) {
            nextPressureFrame += 1000/30;
        } else {
            nextPressureFrame = now + 1000/30;
        }
    }
    requestAnimationFrame(pressureTask);
}

// Handles various background tasks, like the ticking sound,
// and the quality lights
function backgroundTask(now) {
    if (playing) {
        // Make sure the record scratch-esque sound is playing.
        if (recordSound.paused) {
            recordSound.play(); 
        }
        // Check if we're at peak quality.
        if (!peakQuality && videoQuality >= vQualThres && audioQuality >= aQualThres) {
            peakQuality = true;
            // Keep track of how long we've been at peak quality for.
            peakQualityTimer = new Timer();
            document.getElementById("peakQualityLight").src = "assets/peakQuality.png";
            document.getElementById("peakTimeDiv").style.backgroundImage = "url('assets/bestTime.png')";
        } else if (peakQuality && (videoQuality < vQualThres || audioQuality < aQualThres)) {
            peakQuality = false;
            document.getElementById("peakQualityLight").src = "assets/notPeakQuality.png";
            document.getElementById("peakTimeDiv").style.backgroundImage = "url('assets/notBestTime.png')";
            document.getElementById("bestTimeDiv").style.backgroundImage = "url('assets/bestTimeRecord.png')";
            document.getElementById("peakTimeText").innerHTML = "0:00";
        } else if (peakQuality) {
            var peakQualityTime = peakQualityTimer.timeElapsed();
            document.getElementById("peakTimeText").innerHTML = peakQualityTime[0];
            if (peakQualityTime[1] >= bestTime && !cheater) {
                localStorage.setItem("bestTime", peakQualityTime[1]);
                bestTime = peakQualityTime[1];
                document.getElementById("bestTime").innerHTML = peakQualityTime[0];
                document.getElementById("bestTimeDiv").style.backgroundImage = "url('assets/bestTime.png')";
            } else {
                document.getElementById("bestTimeDiv").style.backgroundImage = "url('assets/bestTimeRecord.png')";
            }
        }
        // If the user is on mobile, make it so that everything infront of the YouTube player is hidden.
        if (mobile || playerType == "Twitch") {
            crankTextContainer.style.zIndex = "0";
            videoNoise.style.zIndex = "0";
            document.getElementById("player").style.zIndex = "1";
        }
        if (playerType == "Twitch") {
            document.getElementById("screenOverlay").style.zIndex = "0";
        }
    } else {
        if (now > debounce) {
            crankTextContainer.style.opacity = 1;
            crankTextContainer.style.zIndex = "4";
            videoNoise.style.zIndex = "1";
            if (playerReady) {
                crankText.innerHTML = "TURN THE VIDEO CRANK TO UNPAUSE VIDEO"; 
                loadingCursor.style.opacity = 0;
            } else {
                crankText.innerHTML = "LOADING...";
                loadingCursor.style.opacity = 1;
            }
        }
        if (!recordSound.paused) {
            recordSound.pause(); 
        }
        peakQuality = false;
        document.getElementById("peakQualityLight").src = "assets/notPeakQuality.png";
        document.getElementById("peakTimeDiv").style.backgroundImage = "url('assets/notBestTime.png')";
        document.getElementById("bestTimeDiv").style.backgroundImage = "url('assets/bestTimeRecord.png')";
        document.getElementById("peakTimeText").innerHTML = "0:00";
    }
    if (videoQualityControl.active || audioQualityControl.active) {
        tickingSound.play();
    } else {
        tickingSound.pause();
    }
    // hehe
    if ((difficulty < 1 || aQualThres != 0.8 || vQualThres != 0.835) && !cheater) {
        // Keeps track of your shame.
        cheater = true;
        alert("How dare you, you filty cheater!");
        localStorage.setItem("bestTime", 0);
        document.getElementById("bestTime").innerHTML = "0:00";
        bestTime = 0;

    }
    requestAnimationFrame(backgroundTask);
}

function setDifficulty(changed) {
    if (changed) {
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
    if (changed) {
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
    document.getElementById("ventingSound").volume = volume / 2;
    document.getElementById("warningSound").volume = volume / 2;
    document.getElementById("volumeLevel").innerHTML = "Please choose your volume level.<br>Current volume level is " + Math.round(volume * 100) + "%.";
}

function setLoop(changed) {
    if (playerType !== "Twitch") {
        if (changed === "true") {
            player.setLoop(document.getElementById("loopCheckbox").checked);
            localStorage.setItem("loop", document.getElementById("loopCheckbox").checked);
        } else {
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

function load() {
    document.getElementById("loadButton").src = "assets/littleButtonPressed.png";
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
                channel: channelName
            });
            player.addEventListener(Twitch.Player.READY, function () {
                player.pause();
                playerReady = true;
            });
        } else {
            alert("Because the Twitch Embed API is dumb, Twitch streams can not be embbeded if you're running Steam-Powered YouTube locally.\nPlease try playing this game off of a local server, or off of my site at https://loganius.org/steamtube/");
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
        if (mobile) {
            player = new YT.Player("player", {
                height: "260",
                width: "450",
                videoId: videoid,
                playerVars: {
                    playsinline: 1,
                    controls: 1,
                    autoplay: 0,
                    loop: 0,
                    playlist: videoid,
                },
                events: {
                    onReady: onYTPlayerReady
                }
            });
        } else {
            player = new YT.Player("player", {
                height: "260",
                width: "450",
                videoId: videoid,
                playerVars: {
                    playsinline: 1,
                    controls: 0,
                    autoplay: 0,
                    loop: 0,
                    playlist: videoid,
                },
                events: {
                    onReady: onYTPlayerReady
                }
            });
        }
    } else {
        player = new VideoPlayer("player", {
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
    videoQuality = 0;
    audioQuality = 0;
    pressure = 0;
    playing = false;
    playerReady = false;
    audioNoise.pause();
    if (platform.os.family === "iOS") {
        audioContext.suspend();
    }
    recordSound.pause();
    document.getElementById("screenOverlay").style.zIndex = "4";
    document.getElementById("turnCrankToPlay").style.zIndex = "3";
    document.getElementById("noise").style.zIndex = "2";
    document.getElementById("player").style.zIndex = "1";
}

function releaseLoadButton() {
    document.getElementById("loadButton").src = "assets/littleButton.png";
}

setDifficulty(false);
setVolume(false);

// Update the style of the .video class if the user is using a version of firefox prior to 52.
if (platform.name === "Firefox" && platform.version < 52) {
    var videoElements = document.getElementsByClassName("video");
    for (var i = 0; i < videoElements; i++) {
        videoElements[i].style.top = "-111px";
        videoElements[i].style.left = "-201px";
    }
} else if (platform.os.family == "iOS" || platform.os.family == "Android") {
    // If the user is on an iOS or Android device, set the mobile variable to true.
    mobile = true;
    alert("You are playing on mobile. On mobile, autoplay may not work. If this happens, please press the \"Play\" button on the YouTube player to start the video.\nAlso note that the audio may not play on mobile, or may not play at the correct volume.\nFor the best experience, please play on desktop.");

    if (platform.os.family == "iOS") {
        document.getElementById("loadButton").style.top = "22px";
        document.getElementById("loadButton").style.left = "62px";
    }

    document.getElementById("screenOverlay").addEventListener("touchstart", function (e) {
        document.getElementById("screenOverlay").style.zIndex = "0";
        var makeOverlayAppearTimeout = setTimeout(function (timeout) {
            document.getElementById("screenOverlay").style.zIndex = "4";
            clearTimeout(timeout);
        }, 3000, makeOverlayAppearTimeout);
    });
}

if (isNaN(bestTime)) {
    bestTime = 0;
    localStorage.setItem("bestTime", bestTime);
}

if (!(window.webkitAudioContext) && !(window.AudioContext)) {
    audioNoise = document.createElement("audio");
    audioNoise.src = assets/noise.mp3;
    audioNoise.loop = "true";
    audioNoise.volume = 0;
    document.body.appendChild(audioNoise);
    legacyAudio = true;
} else {
    audioContext = new (window.webkitAudioContext || window.AudioContext)();
    pinkNoise = audioContext.createPinkNoise();
    pinkGain = audioContext.createGain();
    pinkGain.gain.value = 0;
    pinkNoise.connect(pinkGain);
    pinkGain.connect(audioContext.destination);
    pinkGain.gain.value = 0; 
}

document.getElementById("bestTime").innerHTML = formatTime(bestTime);
document.getElementById("pressureVent").addEventListener("mousedown", ventPressed);
document.getElementById("pressureVent").addEventListener("mouseout", ventReleased);
document.getElementById("pressureVent").addEventListener("mouseup", ventReleased);
document.getElementById("pressureVent").addEventListener("touchstart", ventPressed);
document.getElementById("pressureVent").addEventListener("touchend", ventReleased);
document.getElementById("difficultySlider").addEventListener("input", function() {setDifficulty(true);});
document.getElementById("volumeSlider").addEventListener("input", function() {setVolume(true);});
document.getElementById("loopCheckbox").addEventListener("input", function() {setLoop(true);});
document.getElementById("loadButton").addEventListener("mousedown", load);
document.getElementById("loadButton").addEventListener("touchstart", load);
document.getElementById("loadButton").addEventListener("mouseout", releaseLoadButton);
document.getElementById("loadButton").addEventListener("mouseup", releaseLoadButton);
document.getElementById("loadButton").addEventListener("touchend", releaseLoadButton);
document.getElementById("videoUrl").addEventListener("keydown", function (e) {
    if (e.key == "Enter") {
        load();
    }
});

if (!mobile) {
    document.getElementById("videoContainer").addEventListener("mousemove", function(e) {e.preventDefault(); e.stopImmediatePropagation(); e.stopPropagation();});
    document.getElementById("videoContainer").addEventListener("mouseover", function(e) {e.preventDefault(); e.stopImmediatePropagation(); e.stopPropagation();});
    document.getElementById("videoContainer").addEventListener("mouseenter", function(e) {e.preventDefault(); e.stopImmediatePropagation(); e.stopPropagation();});
    document.getElementById("videoContainer").addEventListener("mouseleave", function(e) {e.preventDefault(); e.stopImmediatePropagation(); e.stopPropagation();});
}
requestAnimationFrame(backgroundTask);
requestAnimationFrame(pressureTask);