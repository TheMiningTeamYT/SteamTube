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

var activeControl;

function rotatePoint(x, y, angle) {
    var x1 = x*Math.cos(angle) - y*Math.sin(angle);
    var y1 = y*Math.cos(angle) + x*Math.sin(angle);
    return [x1, y1];
}


function toCoterminalAngle(angle) {
    if (angle > 0 && angle < 2*Math.PI) {
        return angle;
    }
    angle = angle % (2*Math.PI);
    if (angle < 0) {
        angle += 2*Math.PI;
    }
    return angle;
}


// Based on my fidget spinner code.
// The rotate callback is to allow custom code to handle momentum
// and velocity.
// Called with the QualityControl object as a param.
function QualityControl(element, rotateCallback) {
    this.active = false;
    this.mouseUp = false;
    this.lastAngle = 0;
    this.lastRotation = 0;
    this.lastRotation2 = 0;
    this.rotation = 0;
    this.angularVelocity = 0;
    this.lastFrame2 = performance.now();
    this.lastFrame = performance.now();
    this.nextFrame = performance.now() + (1000/30);
    this.callback = rotateCallback;
    
    this.control = element;
    this.control.draggable = false;
    this.control.addEventListener("mousedown", this.mousedown.bind(this));
    this.control.addEventListener("touchstart", this.touchstart.bind(this));
    this.control.addEventListener("touchmove", this.touchmove.bind(this));
    this.control.addEventListener("touchend", this.up.bind(this));
    requestAnimationFrame(this.frame.bind(this));
}

QualityControl.prototype.touchstart = function(e) {
    e.preventDefault();
    if (!this.active) {
        var boundingRect = this.control.getBoundingClientRect();
        var centerX = boundingRect.x + (boundingRect.width / 2);
        var centerY = boundingRect.y + (boundingRect.height / 2);
        this.lastAngle = Math.atan2(e.targetTouches[0].clientY - centerY, e.targetTouches[0].clientX - centerX);
        this.rotation = toCoterminalAngle(this.rotation);
        this.lastRotation = toCoterminalAngle(this.lastRotation);
        this.lastRotation2 = toCoterminalAngle(this.lastRotation2);
        this.active = true;
    }
}

QualityControl.prototype.touchmove = function(e) {
    e.preventDefault();
    if (this.active) {
        var boundingRect = this.control.getBoundingClientRect();
        var centerX = boundingRect.x + (boundingRect.width / 2);
        var centerY = boundingRect.y + (boundingRect.height / 2);
        var angle = Math.atan2(e.targetTouches[0].clientY - centerY, e.targetTouches[0].clientX - centerX);
        this.rotation += angle - this.lastAngle;
        if (this.lastAngle < -Math.PI/2 && angle > Math.PI/2) {
            this.rotation -= 2*Math.PI;
        } else if (this.lastAngle > Math.PI/2 && angle < -Math.PI/2) {
            this.rotation += 2*Math.PI;
        }
        this.lastAngle = angle;
    }
}

QualityControl.prototype.mousedown = function(e) {
    e.preventDefault();
    if (!this.active) {
        if (typeof(activeControl) !== "undefined" && activeControl.active) {
            activeControl.mouseUp = true;
            activeControl.active = false;
        }
        var boundingRect = this.control.getBoundingClientRect();
        var centerX = boundingRect.x + (boundingRect.width / 2);
        var centerY = boundingRect.y + (boundingRect.height / 2);
        this.lastAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
        this.rotation = toCoterminalAngle(this.rotation);
        this.lastRotation = toCoterminalAngle(this.lastRotation);
        this.lastRotation2 = toCoterminalAngle(this.lastRotation2);
        this.active = true;
        activeControl = this;
    }
}

QualityControl.prototype.mousemove = function(e) {
    e.preventDefault();
    if (this.active && !this.mouseUp) {
        var boundingRect = this.control.getBoundingClientRect();
        var centerX = boundingRect.x + (boundingRect.width / 2);
        var centerY = boundingRect.y + (boundingRect.height / 2);
        var angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
        this.rotation += angle - this.lastAngle;
        if (this.lastAngle < -Math.PI/2 && angle > Math.PI/2) {
            this.rotation -= 2*Math.PI;
        } else if (this.lastAngle > Math.PI/2 && angle < -Math.PI/2) {
            this.rotation += 2*Math.PI;
        }
        this.lastAngle = angle;
    }
}

QualityControl.prototype.up = function(e) {
    e.preventDefault();
    if (this.active) {
        this.mouseUp = true;
    }
}

QualityControl.prototype.frame = function(now) {
    // Only run at 30 FPS for that flash game aesthetic.
    // (I checked, the original Steam-Powered YouTube is locked to 30FPS.)
    if (now >= this.nextFrame) {
        this.callback(this, now - this.lastFrame2);
        if (this.active && this.mouseUp) {
            this.angularVelocity = (this.rotation - this.lastRotation2)*0.5/(now - this.lastFrame2);
            this.active = false;
            this.mouseUp = false;
        }
        if (this.rotation != this.lastRotation) {
            var shadow = rotatePoint(0, 20, -this.rotation);
            this.control.style.transform = "rotate(" + this.rotation + "rad)";
            this.control.style.filter = "drop-shadow(" + shadow[0] + "px " + shadow[1] + "px 3px rgba(0,0,0,0.7))";
        }
        this.lastRotation2 = this.lastRotation;
        this.lastRotation = this.rotation;
        this.lastFrame2 = this.lastFrame;
        this.lastFrame = now;
        if (now - this.nextFrame < 500/30) {
            this.nextFrame += 1000/30;
        } else {
            this.nextFrame = now + 1000/30;
        }
    }
    requestAnimationFrame(this.frame.bind(this));
}

document.body.addEventListener("mousemove", function(e) {
    if (typeof(activeControl) !== "undefined" && activeControl.active) {
        activeControl.mousemove(e);
    }
});

document.body.addEventListener("mouseup", function(e) {
    if (typeof(activeControl) !== "undefined" && activeControl.active) {
        activeControl.up(e);
    }
});