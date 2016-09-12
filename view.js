function drawBackground(backgroundColor) {
    ctx.beginPath();
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = backgroundColor;
    ctx.fill();
    ctx.closePath();
    ctx.save();
    ctx.restore();
}

function drawGameScene() {
    drawQuote(solutionContext, solutionCanvas, "white");
    drawPlayerScore();
    drawLifePointsBar();
    drawGlitchNDestroyMainScreen();

    if (isGlitchVisible) {
        drawGlitch();
        drawColorToMatch();
        // drawNoise();
        if (timers[0] >= 3000 && timers[0] <= 6000) {
            drawGlitchInCanvas();
            //glitch noise music
            var collisionSoundURL = jsfxr([3, , 0.3956, , 0.2475, 0.408, , 0.1276, , , , , , 0.534, , , , , 1, , , 0.0966, , 0.5]);
            var collisionAudio = new Audio();
            collisionAudio.src = collisionSoundURL;
            collisionAudio.play();
        }
        if (timers[0] > 6000) {
            timers[0] = 0;
        }
    }
}

function drawGlitchInCanvas() {
    drawQuote(ctx, canvas, "black");
    drawGlitchWords();
    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var data = imageData.data;

    shiftColorChannels(data, 1, 2, imageData.width, imageData.height, 100, 100, 4, 2);
    shiftPixelsVertically(data, data.length / 2);
    shiftColorChannels(data, 2, 0, imageData.width, imageData.height, 0, 100, 4, 2);
    shiftPixelsVertically(data, data.length / 5);
    shiftColorChannels(data, 0, 1, imageData.width, imageData.height, 300, 300, 4, 2);
    shiftPixelsVertically(data, data.length / 3);
    shiftColorChannels(data, 1, 0, imageData.width, imageData.height, 300, imageData.height, 4, 4);
    imageData.data = data;
    ctx.putImageData(imageData, 0, 0);
}

function shiftPixelsVertically(data, verticalSwapOffset) {
    if (verticalSwapOffset > data.length / 2) {
        verticalSwapOffset = data.length / 2
    }
    for (var i = 0; i < verticalSwapOffset - 1; i++) {
        var temp = data[i];
        data[i] = data[i + verticalSwapOffset];
        data[i + verticalSwapOffset] = temp;
    }
}


/**
 * Shift the color channels in order to to transform the image into a glitch
 * @param data : array[]  the pixels you want to glitch
 * @param  sourceRGBChannel : Number a number from 0 to 2 (R,G,B)that indicates the source channel to switch
 * @param  targetRGBChannel : Number a number from 0 to 2 (R,G,B)that indicates the target channel to be switched
 * @param  width : Number image width
 * @param  height : Number image height
 * @param  seedX : Number the x point where you want to start the shift
 * @param  seedY : Number the y point where you want to start the shift
 * @param  glitchFactor : Number a number from 1 to 4 to play with for your glitches (traditional glitch is 4)
 * @param  lengthFactor : Number a number from 1 to 4 to set how far is extending the glitch (4 is full image)
 */
function shiftColorChannels(data, sourceRGBChannel, targetRGBChannel, width, height, seedX, seedY, glitchFactor, lengthFactor) {
    // through the pixels in this column
    for (var y = 0; y < height; y++) {
        var offsetY = seedY + y;
        //wrap the image vertically if you go out of the top or bottom border
        if (offsetY >= height) {
            offsetY -= height;
        }
        // through the pixels in this row
        for (var x = 0; x < width; x++) {
            var offsetX = seedX + x;
            //wrap the image horizontally if you go out of the right or left border
            if (offsetX >= width) {
                offsetX -= width;
            }
            var targetPixel = y * width * glitchFactor + x * lengthFactor;
            var sourcePixel = offsetY * width * glitchFactor + offsetX * lengthFactor;
            //change a channel of the target pixel with a source rgb channel
            data[targetPixel + targetRGBChannel] = data[sourcePixel + sourceRGBChannel];
        }
    }
}

function drawQuote(context, canvas, textColor) {
    var quote = quotes[currentQuoteId];
    var currentY = 100;
    for (var i = 0; i < quote.length; i++) {
        drawPixelWord(context, quote[i], (canvas.width / 2 ) - quote[i].length * 7, currentY, 7, textColor);
        currentY += 50;
    }
}

function drawGlitch() {
    for (var i = 0; i < glitch.tiles.length; i++) {
        var glitchTile = glitch.tiles[i];
        if (glitchTile.colorId > 0) {
            ctx.beginPath();
            ctx.rect(glitchTile.pos.x, glitchTile.pos.y, glitchTile.width, glitchTile.height);
            ctx.fillStyle = glitchColors[glitchTile.colorId];
            ctx.fill();
            ctx.closePath();
            ctx.save();
            ctx.restore();
        }
    }
}

function drawGlitchWords() {
    for (var i = 0; i < glitchWords.length; i++) {
        drawPixelWord(ctx, glitchWords[i][0], glitchWords[i][1], glitchWords[i][2], glitchWords[i][3], "rgba(0,0,0,0.6)");
    }
}

function drawPixelWord(context, word, initialWordX, initialWordY, pixelSize, wordColor) {
    var initialLetterX = initialWordX;
    var initialLetterY = initialWordY;

    for (var i = 0; i < word.length; i++) {
        var charCode = word.charCodeAt(i);
        var pixelLetter = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        if (charCode >= 48 && charCode <= 57) {
            pixelLetter = pixelNumbers[charCode - 48];
        } else if (charCode >= 65 && charCode <= 90) {
            pixelLetter = pixelLetters[charCode - 65];
        }
        drawPixelChar(context, pixelLetter, initialLetterX, initialWordY, pixelSize, wordColor);
        initialLetterX += pixelSize * 4;
    }
}


function drawPixelChar(context, pixelLetter, initialX, initialY, pixelSize, charColor) {
    var letterX = initialX;
    var letterY = initialY;
    //var fontChar = [1,1,1,0,0,1,1,1,1,1,0,0,1,1,1];
    var j = -1;
    for (var i = 0; i < pixelLetter.length; i++) {
        if (i % 3 == 0) {
            j++; //this row is full, go to the next one
        }
        letterX = pixelSize * (i % 3) + initialX;
        letterY = pixelSize * (j % 5) + initialY;
        if (pixelLetter[i] === 1) {
            context.beginPath();
            context.rect(letterX, letterY, pixelSize, pixelSize);
            context.fillStyle = charColor;
            context.fill();
            context.closePath();
            context.save();
            context.restore();
        }

    }
}


function clearView() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    externalContext.clearRect(0, 0, externalCanvas.width, externalCanvas.height);
    solutionContext.clearRect(0, 0, solutionCanvas.width, solutionCanvas.height);
}

function draw() {
    clearView();
    if (isGameOver) {
        drawGameOverScreen();
    } else if (isGameScreen) {
        drawGameScene();
    } else if (isMainScreen) {
        drawMainScreen();
    } else if (isRulesScreen) {
        drawRulesScreen();
    }

}

function drawGameOverScreen() {
    var pixelSize = 8;
    drawPixelWord(ctx, "GAME OVER", canvas.width / 2 - 4 * pixelSize * 4, canvas.height / 4 - pixelSize / 2, pixelSize, "white");
    drawPixelWord(ctx, "YOUR SCORE IS " + score, canvas.width / 2 - 4 * pixelSize * 7, canvas.height / 2 - pixelSize / 2, pixelSize, "white");
    drawPixelWord(ctx, "YOUR HIGHSCORE IS " + highscore, canvas.width / 2 - 4 * pixelSize * 9, canvas.height / 4 * 3 - pixelSize / 2, pixelSize, "white");
}

function drawRulesScreen() {
    //draw play button
    drawPixelWord(externalContext, playButton[0], playButton[1], playButton[2], playButton[5], "white");
    //draw rules button
    drawPixelWord(externalContext, rulesButton[0], rulesButton[1], rulesButton[2], rulesButton[5], "white");
    // draw the rules
    var pixelSize = 4;
    drawPixelWord(ctx, "A TREMENDOUS GLITCH IS COVERING THE SCREEN", 0, 50, pixelSize, "white");
    drawPixelWord(ctx, "DESTROY IT BEFORE IT IS TOO LATE", 0, 100, pixelSize, "white");
    drawPixelWord(ctx, "TOUCH THE TILE OF THE MATCHING COLOR", 0, 150, pixelSize, "white");
    drawPixelWord(ctx, "TO SAVE THE QUOTE HIDDEN BEHIND IT", 0, 200, pixelSize, "white");
    drawPixelWord(ctx, "DO NOT BE DISTRACTED WHEN THE GLITCH GETS STRONGER", 0, 250, pixelSize, "white");
    drawPixelWord(ctx, "THE TILES ARE STILL THERE AT THE SAME PLACE", 0, 300, pixelSize, "white");
}


function drawMainScreen() {
    var pixelSize = 10;
    if (timers[0] >= 3000) {
        drawBackground(glitchAnimationBackgroundColor);
    }
    drawPixelWord(ctx, "GLITCH N DESTROY", 0, canvas.height / 2, pixelSize, "white");

    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var data = imageData.data;
    if (timers[0] >= 3000) {
        //glitch noise music
        var collisionSoundURL = jsfxr([3, , 0.3956, , 0.2475, 0.408, , 0.1276, , , , , , 0.534, , , , , 1, , , 0.0966, , 0.5]);
        var collisionAudio = new Audio();
        collisionAudio.src = collisionSoundURL;
        collisionAudio.play();
        shiftColorChannels(data, 1, 2, imageData.width, imageData.height, 100, 100, 4, 2);
        // shiftPixelsVertically(data, data.length / 2);
        if (timers[0] >= 4000) {
            shiftColorChannels(data, 2, 0, imageData.width, imageData.height, 0, 100, 4, 2);
            shiftPixelsVertically(data, data.length / 5);
        }
        if (timers[0] >= 5500) {
            shiftColorChannels(data, 0, 1, imageData.width, imageData.height, 300, 300, 4, 2);
        }
        if (timers[0] >= 7000) {
            shiftColorChannels(data, 2, 1, imageData.width, imageData.height, 300, 300, 4, 4);
        }
        if (timers[0] >= 8500) {
            shiftColorChannels(data, 1, 0, imageData.width, imageData.height, 0, 0, 4, 4);
            timers[0] = 3000;
            glitchAnimationBackgroundColor = glitchColors[Math.floor(Math.random() * glitchColors.length)];
        }
        imageData.data = data;
        ctx.putImageData(imageData, 0, 0);
        drawPixelWord(ctx, "GLITCH N DESTROY", 100, canvas.height / 2, pixelSize, "black");
        drawNoise();
    }
    drawPixelWord(externalContext, playButton[0], playButton[1], playButton[2], playButton[5], "white");
    drawPixelWord(externalContext, rulesButton[0], rulesButton[1], rulesButton[2], rulesButton[5], "white");
}

function drawNoise() {
    for (var i = 0; i < glitch.tiles.length; i++) {
        var tile = glitch.tiles[i];
        if (tile.colorId > 0) {
            for (var j = 0; j < tile.width; j++) {
                ctx.beginPath();
                ctx.rect(Math.random() * tile.width + tile.pos.x, Math.random() * tile.height + tile.pos.y, 1, Math.floor(Math.random() * 5));
                ctx.fillStyle = "rgb(" + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + ")";
                ctx.fill();
                ctx.closePath();
                ctx.save();
                ctx.restore();
            }
        }
    }
}

function drawColorToMatch() {
    externalContext.beginPath();
    externalContext.rect(10, 10, 50, 50);
    externalContext.fillStyle = glitchColors[colorToMatch];
    externalContext.fill();
    externalContext.closePath();
    externalContext.save();
    externalContext.restore();
}

function drawLifePointsBar() {
    externalContext.beginPath();
    var barHeight = 10;
    externalContext.rect(0, externalCanvas.height - barHeight, Math.floor(externalCanvas.width * lifepoints / totalLifePoints), barHeight);
    externalContext.fillStyle = "white";
    externalContext.fill();
    externalContext.closePath();
    externalContext.save();
    externalContext.restore();
}

function drawPlayerScore() {
    var letterSize = 10;
    drawPixelWord(externalContext, score.toString(), externalCanvas.width - (letterSize * 4 * score.toString().length) - 10, 10, letterSize, "gray");
}

function drawGlitchNDestroyMainScreen(context, color) {
    var pixelSize = 7;
    var initialPosition = externalCanvas.width / 2 - 8 * 4 * pixelSize;
    drawPixelWord(externalContext, "GLITCH N DESTROY", initialPosition, 20, pixelSize, "white");
}
