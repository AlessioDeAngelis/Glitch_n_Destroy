/**
 * Created by a.deangelis on 22/08/2016.
 */

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
document.addEventListener("touchstart", touchStartHandler, false);
document.addEventListener("touchend", touchEndHandler, false);
document.addEventListener("touchmove", touchMoveHandler, false);
document.addEventListener("mousedown", mouseDownHandler, false);
document.addEventListener("mouseup", mouseUpHandler, false);



function keyDownHandler(e) {
    if (e.keyCode == 39 || e.keyCode == 68) {
        rightPressed = true;
    }
    if (e.keyCode == 37 || e.keyCode == 65) {
        leftPressed = true;
    }
    if (e.keyCode == 40 || e.keyCode == 83) {
        downPressed = true;
    }
    if (e.keyCode == 38 || e.keyCode == 87) {
        upPressed = true;
    }
    if (e.keyCode == 13) { //enter
        enterPressed = true;
    }
}

function keyUpHandler(e) {
    if (e.keyCode == 39 || e.keyCode == 68) {
        rightPressed = false;
    }
    if (e.keyCode == 37 || e.keyCode == 65) {
        leftPressed = false;
    }
    if (e.keyCode == 40 || e.keyCode == 83) {
        downPressed = false;
    }
    if (e.keyCode == 38 || e.keyCode == 87) {
        upPressed = false;
    }
    if (e.keyCode == 13) { //enter
        enterPressed = false;
    }

}

function mouseDownHandler(evt) {
    evt.preventDefault();
    screenTouched = true;
    lastScreenTouch = new Vector2(evt.clientX, evt.clientY);
}

function mouseUpHandler(evt) {
    evt.preventDefault();
    screenTouched = false;
    lastScreenTouch = null;
}

function touchStartHandler(evt) {
    evt.preventDefault();
    var touches = evt.changedTouches;
    screenTouched = true;
    var touch = touches[0];
    lastScreenTouch = new Vector2(touch.clientX, touch.clientY);
}

function touchEndHandler(evt) {
    evt.preventDefault();
    screenTouched = false;
    leftPressed = false;
    rightPressed = false;
    downPressed = false;
    upPressed = false;
    angleBetweenPlayerAndTouch = null;
  //  lastScreenTouch = null;
}

function touchStartHandlerOld(evt) {
    evt.preventDefault();
    var touches = evt.changedTouches;
    screenTouched = true;
    var touch = touches[0];
   //With atan2(), the y coordinate is passed as the first argument and the x coordinate is passed as the second argument.
    angleBetweenPlayerAndTouch = Math.atan2(touch.pageY - (player.pos.y + player.radius), touch.pageX - (player.pos.x + player.radius));
}

function touchEndHandlerOld(evt) {
    evt.preventDefault();
    screenTouched = false;
    leftPressed = false;
    rightPressed = false;
    downPressed = false;
    upPressed = false;
    angleBetweenPlayerAndTouch = null;
}
function touchMoveHandler(evt) {
    touchStartHandler(evt);
}

function resizeCanvas(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
