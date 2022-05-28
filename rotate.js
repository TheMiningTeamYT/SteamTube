/*
Modifed from: Modifed from https://bl.ocks.org/joyrexus/7207044

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
// Generated by CoffeeScript 1.6.3

// Target 1 & 2 are the video & audio quality controls
var audioQualityControl = document.getElementById("audioQualityControl");
var videoQualityControl = document.getElementById("videoQualityControl");

// Active is if the user is actively turning the control.
audioQualityControl.dataset.active = false;
audioQualityControl.dataset.angle = 0;

videoQualityControl.dataset.active = false;
videoQualityControl.dataset.angle = 0;

// DragObject is a function modifed from the original script that handles the dragging and rotation of the object.
// springBack handles ensuring the angle of rotation for the controls never exceeds 360 degrees.
// The name "springBack" is holdover from when I had the wheel spin back to it's starting locaton.
DragObject(audioQualityControl);
// Check the rotation of the controls every ~1/30 of a second.
setInterval(springBack, 33, audioQualityControl);
DragObject(videoQualityControl);
setInterval(springBack, 33, videoQualityControl);

// Code I have a hard time understanding.
// Someone else, please explain this.
function DragObject(target) {
  var R2D, center, init, rotate, rotation, start, startAngle, stop;

  active = false;

  angle = 0;

  rotation = 0;

  startAngle = 0;

  center = {
    x: 0,
    y: 0
  };

  document.ontouchmove = function(e) {
    return e.preventDefault();
  };

  init = function() {
    target.addEventListener("mousedown", start, false);
    target.addEventListener("mousemove", rotate, false);
    return document.addEventListener("mouseup", stop, false);
  };

  R2D = 180 / Math.PI;

  start = function(e) {
    var height, left, top, width, x, y, _ref;
    e.preventDefault();
    _ref = this.getBoundingClientRect(), top = _ref.top, left = _ref.left, height = _ref.height, width = _ref.width;
    center = {
      x: left + (width / 2),
      y: top + (height / 2)
    };
    x = e.clientX - center.x;
    y = e.clientY - center.y;
    startAngle = R2D * Math.atan2(y, x);
    target.dataset.active = true;
    return active = true;
  };

  rotate = function(e) {
    angle = parseFloat(this.dataset.angle);
    var d, x, y;
    e.preventDefault();
    x = e.clientX - center.x;
    y = e.clientY - center.y;
    d = R2D * Math.atan2(y, x);
    rotation = d - startAngle;

    // Because active is a global variable, we need to get the active state for this specific target.
    active = target.dataset.active;
    if (active == "true") {
      var dropShadow = getRotationPoint(20, 20, (angle + rotation));
      this.style.filter = "drop-shadow(" + dropShadow[0] + "px " + dropShadow[1] + "px 3px rgba(0,0,0,0.7)";
      return this.style.transform = "rotate(" + (angle + rotation) + "deg)";
    }
  };

  stop = function() {
    angle += rotation;
    target.dataset.angle = angle;
    target.dataset.active = false;
    return active = false;
  };

  init();

}
function springBack(target) {
  var angle = parseInt(target.dataset.angle);
  
  // If the angle is negative, make it positive again.
  if (angle < 0) {
    angle += 360;
  }
  if (angle > 360) {
    angle -= 360;
  }
  target.dataset.angle = angle;
}
