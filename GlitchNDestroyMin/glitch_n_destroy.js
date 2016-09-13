var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
var externalCanvas = document.getElementById("externalCanvas");
var externalContext = externalCanvas.getContext("2d");
var solutionCanvas = document.getElementById("solutionCanvas");
var solutionContext = solutionCanvas.getContext("2d");
var rightPressed = false;
var leftPressed = false;
var upPressed = false;
var downPressed = false;
var enterPressed = false;
var totalScore = 0;
var backgroundColor = '#eee';
var highscore = 0;
var isGameOver = false;
var isMainScreen = true;
var isGameScreen = false;
var isRulesScreen = false;
var isGlitchVisible = true;
var screenTouched = false;
var glitch = null;
var lastScreenTouch = null;
var elapsedTime = null;
var lastSavedDate = null;
var colorToMatch = 2;
var colorOccurrencesArray = [];
var timers = [];
var lifepoints = 150;
var totalLifePoints = 150;
var score = 0;
var glitchColors = ["rgba(255, 255, 255, 0.1)", "red", "#00FF00", "yellow", "blue", "cyan", "magenta"];
var glitchWords = [];
var currentQuoteId = 0;
var quotes = [];
var pixelLetters = [];
var pixelNumbers = [];
var glitchAnimationBackgroundColor = "orange";
var playButton = [];
var rulesButton = [];

document.addEventListener("touchstart", touchStartHandler, false);
document.addEventListener("touchend", touchEndHandler, false);
document.addEventListener("touchmove", touchMoveHandler, false);
document.addEventListener("mousedown", mouseDownHandler, false);
document.addEventListener("mouseup", mouseUpHandler, false);

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

function touchMoveHandler(evt) {
    touchStartHandler(evt);
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function createNewGlitch(glitchSize) {
    glitch = new Glitch();
    var glitchTileX = 0;
    var glitchTileY = 0;
    var tilesInRow = Math.sqrt(glitchSize);
    glitch.tilesInRow = tilesInRow;
    var j = -1;
    for (var i = 0; i < glitchSize; i++) {
        var glitchTile = new GlitchTile();
        if (i % tilesInRow == 0) {
            j++;
        }
        glitchTile.id = i;
        glitchTile.colorId = Math.floor(Math.random() * (glitchColors.length - 1)) + 1; //no id 0 since it is for the black
        var glitchTileWidth = canvas.width / tilesInRow;
        var glitchTileHeight = canvas.height / tilesInRow;
        glitchTile.height = glitchTileHeight;
        glitchTile.width = glitchTileWidth;
        glitchTileX = glitchTileWidth * (i % tilesInRow);
        glitchTileY = glitchTileHeight * (j % tilesInRow);
        glitchTile.pos = new Vector2(glitchTileX, glitchTileY);
        glitch.tiles.push(glitchTile);
    }
}

(function startGlitchNDestroy() {
    clearGame();
    initQuotes();
    initMainScreenButtons();
    initPixelLetters();
    initTimers();
    generateGlitchWords(1);
    startNewGame();
    gameLoop();
}());

function startNewGame() {
    initTimers();
    createNewGlitch(2 * 2);
    initColorOccurrencesArray();
}

function clearGame() {
    colorOccurrencesArray.length = 0;
    timers.length = 0;
    glitchWords.length = 0;
    lifepoints = totalLifePoints;
    score = 0;
    highscore = localStorage.highscore;
    if (typeof (highscore) === "undefined") {
        highscore = 0;
    }
}

function initMainScreenButtons() {
    var pixelSize = 7;
    playButton = ["PLAY", 10, externalCanvas.height / 2, pixelSize * 5 * 4, pixelSize * 5, pixelSize]; //text, posX, posY, width, height, pixelSize
    rulesButton = ["RULES", externalCanvas.width - 6 * pixelSize * 4, externalCanvas.height / 2, pixelSize * 7, pixelSize * 5, pixelSize]; //text, posX, posY, width, height, pixelSize
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function initTimers() {
    timers.push(0);
    timers.push(0);
    timers.push(0);
    timers.push(0);
    timers.push(0);
    lastSavedDate = new Date();
}

function generateGlitchWords(numOfWords) {
    glitchWords.length = 0;
    var availableChars = "ABCDEFGHILJKMNOPQRSTUVWXYZ0123456789";
    for (var i = 0; i < numOfWords; i++) {
        var wordLength = Math.floor(Math.random() * 20) + 1;
        var word = "";
        var pixelSize = 5;
        for (var j = 0; j < wordLength; j++) {
            word += availableChars.charAt((Math.floor(Math.random() * availableChars.length)));
        }
        var posX = Math.floor(Math.random() * (canvas.width - pixelSize * wordLength * 4));
        var posY = Math.floor(Math.random() * (canvas.height - pixelSize * 2));

        glitchWords[i] = [word, posX, posY, pixelSize];
    }
}

function update() {

    updateTimers();
    if (isMainScreen || isRulesScreen || isGameOver) {
        if (screenTouched && isPlayButtonSelected(new Vector2(lastScreenTouch.x - externalCanvas.offsetLeft, lastScreenTouch.y - externalCanvas.offsetTop))) {
            isMainScreen = false;
            isGameScreen = true;
            isGameOver = false;
            isRulesScreen = false;
            timers[0] = 0;
            clearGame();
            startNewGame();
        } else if (screenTouched && isRulesButtonSelected(new Vector2(lastScreenTouch.x - externalCanvas.offsetLeft, lastScreenTouch.y - externalCanvas.offsetTop))) {
            isMainScreen = false;
            isRulesScreen = true;
            isGameOver = false;
            isGameScreen = false;
            timers[0] = 0;
        }
    }
    else if (isGameScreen) {
        if (isGlitchVisible) {
            updateLifepoints();
        }
        if (lifepoints <= 0) {
            if (score > highscore) {
                localStorage.highscore = score;
                highscore = score;
            }
            isGameOver = true;
            isGameScreen = false;
            return;
        }
        updateGlitch();
        updateColorToMatch();
        if (timers[4] >= 3000 && !isGlitchVisible) {
            timers[4] = 0;
            isGlitchVisible = true;
            changeCurrentQuoteId();
            timers[0] = 0;
        }
        if (isGlitchOver()) {
            isGlitchVisible = false;
            timers[4] = 0;
            createNewGlitch((glitch.tilesInRow + 1) * (glitch.tilesInRow + 1));
            calculateColorOccurrencesArray();
            colorToMatch = findNextColorToMatch();
        }
    }
}

function initQuotes() {
    quotes[0] = ["LIFE", "IS MORE FUN", "IF YOU PLAY", "GAMES", "ROALD DAHL"];
    quotes[1] = ["ALWAYS", "TRUST", "COMPUTER GAMES", "RIDLEY PEARSON"];
    quotes[2] = ["YOU HAVE TO LEARN", "THE RULES OF THE", "GAME AND THEN", "YOU HAVE TO PLAY", "BETTER THAN", "ANYONE ELSE", "EINSTEIN"];
    quotes[3] = ["IF YOU HAVE HAD", "A GOOD TIME", "PLAYING THE GAME,", "YOU ARE A WINNER", "EVEN IF YOU LOSE", "MALCOLM FORBES"];
    quotes[4] = ["WE DO NOT STOP", "PLAYING BECAUSE", "WE GROW OLD", "WE GROW OLD", "BECAUSE WE STOP PLAYING", "BENJAMIN FRANKLIN"];
    currentQuoteId = Math.floor(Math.random() * quotes.length);
}

function updateTimers() {
    var now = new Date();
    for (var i = 0; i < timers.length; i++) {
        timers[i] += now - lastSavedDate;
    }
    lastSavedDate = now;
}

function updateLifepoints() {
    if (timers[2] >= 1000 && isGlitchVisible) {
        lifepoints--;
        timers[2] = 0;
    }
}

function changeCurrentQuoteId() {
    currentQuoteId = (currentQuoteId + 1) % quotes.length;
}

function isGlitchTileSelected(glitchTile, touchPosition) {
    return touchPosition.x >= glitchTile.pos.x && touchPosition.x <= glitchTile.pos.x + glitchTile.width
        &&
        touchPosition.y >= glitchTile.pos.y && touchPosition.y <= glitchTile.pos.y + glitchTile.height;
}

function isPlayButtonSelected(touchPosition) {
    return touchPosition.x >= playButton[1] && touchPosition.x <= playButton[1] + playButton[3]
        &&
        touchPosition.y >= playButton[2] && touchPosition.y <= playButton[2] + playButton[4];
}

function isRulesButtonSelected(touchPosition) {
    return touchPosition.x >= rulesButton[1] && touchPosition.x <= rulesButton[1] + rulesButton[3]
        &&
        touchPosition.y >= rulesButton[2] && touchPosition.y <= rulesButton[2] + rulesButton[4];
}

function updateGlitch() {
    if (screenTouched && isGlitchVisible) {
        for (var i = 0; i < glitch.tiles.length; i++) {
            var glitchTile = glitch.tiles[i];
            if (isGlitchTileSelected(glitchTile, new Vector2(lastScreenTouch.x - canvas.offsetLeft, lastScreenTouch.y - canvas.offsetTop))) {
                if (glitchTile.colorId === colorToMatch) {
                    var newColorId = 0;
                    var collisionSoundURL = jsfxr([0, , 0.2471, , 0.4205, 0.4485, , 0.1878, , , , , , 0.2196, , , , , 1, , , , , 0.5]); //powerup
                    var collisionAudio = new Audio();
                    collisionAudio.src = collisionSoundURL;
                    collisionAudio.play();
                    propagateColorChange(glitchTile.id, colorToMatch, newColorId);
                    break;
                } else {
                    var collisionSoundURL = jsfxr([1, , 0.0311, , 0.2493, 0.635, , -0.3312, , , , , , , , , , , 1, , , , , 0.5]); //powerup
                    var collisionAudio = new Audio();
                    collisionAudio.src = collisionSoundURL;
                    collisionAudio.play();
                    lifepoints -= 10;
                }
            }
        }
        screenTouched = false;
    }
}

function updateColorToMatch() {
    if (colorOccurrencesArray[colorToMatch] === 0 || timers[1] >= 11000 - Math.floor(Math.random() * 10000)) {
        timers[1] = 0;
        colorToMatch = findNextColorToMatch();
    }
}

function initColorOccurrencesArray() {
    calculateColorOccurrencesArray();
    colorToMatch = findNextColorToMatch();
}

function calculateColorOccurrencesArray() {
    for (var i = 0; i < glitchColors.length; i++) {
        colorOccurrencesArray[i] = 0;
    }
    for (var i = 0; i < glitch.tiles.length; i++) {
        colorOccurrencesArray[glitch.tiles[i].colorId]++;
    }
}

function isGlitchOver() {
    return colorOccurrencesArray[0] === glitch.tiles.length;
}

function findNextColorToMatch() {
    var currentGlitchColors = [];
    for (var colorId = 1; colorId < glitchColors.length; colorId++) {
        if (colorOccurrencesArray[colorId] > 0) {
            currentGlitchColors.push(colorId);
        }
    }
    return currentGlitchColors[Math.floor(Math.random() * (currentGlitchColors.length))];
}

function propagateColorChange(glitchTileId, colorIdToCheck, newColorId) {
    if (typeof (glitch.tiles[glitchTileId]) === "undefined") {
        return;
    }
    if (glitch.tiles[glitchTileId].colorId !== colorIdToCheck || glitch.tiles[glitchTileId].colorId === newColorId) {
        return;
    }
    lifepoints++;
    score++;
    colorOccurrencesArray[glitch.tiles[glitchTileId].colorId]--;
    colorOccurrencesArray[newColorId]++;
    glitch.tiles[glitchTileId].colorId = newColorId;
    var rowNumber = Math.floor(glitchTileId / glitch.tilesInRow);
    if (rowNumber === Math.floor((glitchTileId + 1) / glitch.tilesInRow) && glitchTileId + 1 < glitch.tiles.length && glitch.tiles[glitchTileId + 1].colorId === colorIdToCheck) {
        propagateColorChange(glitchTileId + 1, colorIdToCheck, newColorId);
    }
    if (rowNumber === Math.floor((glitchTileId - 1) / glitch.tilesInRow) && glitchTileId - 1 >= 0 && glitch.tiles[glitchTileId - 1].colorId === colorIdToCheck) {
        propagateColorChange(glitchTileId - 1, colorIdToCheck, newColorId);
    }
    if (glitchTileId + glitch.tilesInRow < glitch.tiles.length && glitch.tiles[glitchTileId + glitch.tilesInRow].colorId === colorIdToCheck) {
        propagateColorChange(glitchTileId + glitch.tilesInRow, colorIdToCheck, newColorId);
    }
    if (glitchTileId - glitch.tilesInRow >= 0 && glitch.tiles[glitchTileId - glitch.tilesInRow].colorId === colorIdToCheck) {
        propagateColorChange(glitchTileId - glitch.tilesInRow, colorIdToCheck, newColorId);
    }
    return;
}

function shuffleGlitch() {
    var colorIdsInGlitch = [];
    for (var i = 0; i < glitch.tiles.length; i++) {
        colorIdsInGlitch.push(glitch.tiles[i].colorId);
    }
    colorIdsInGlitch = shuffleArray(colorIdsInGlitch);
    for (var i = 0; i < glitch.tiles.length; i++) {
        glitch.tiles[i].colorId = colorIdsInGlitch[i];
    }
}

function initPixelLetters() {
    pixelLetters.push([0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1]);
    pixelLetters.push([1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0]);
    pixelLetters.push([0, 1, 0, 1, 0, 1, 1, 0, 0, 1, 0, 1, 0, 1, 0]);
    pixelLetters.push([1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0]);
    pixelLetters.push([1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1, 1, 1]);
    pixelLetters.push([1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 0]);
    pixelLetters.push([0, 1, 0, 1, 0, 1, 1, 0, 0, 1, 0, 1, 0, 1, 1]);
    pixelLetters.push([1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1]);
    pixelLetters.push([1, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 1]);
    pixelLetters.push([0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 0]);
    pixelLetters.push([1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1]);
    pixelLetters.push([1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 1]);
    pixelLetters.push([1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1]);
    pixelLetters.push([0, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1]);
    pixelLetters.push([1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1]);
    pixelLetters.push([0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 0, 0]);
    pixelLetters.push([0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 0, 0, 1]);
    pixelLetters.push([0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 0, 1]);
    pixelLetters.push([0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0]);
    pixelLetters.push([1, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0]);
    pixelLetters.push([1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1]);
    pixelLetters.push([1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 0]);
    pixelLetters.push([1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1]);
    pixelLetters.push([1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1]);
    pixelLetters.push([1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 0, 0, 1, 0]);
    pixelLetters.push([1, 1, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 1, 1]);

    pixelNumbers.push([0, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 0]);
    pixelNumbers.push([0, 1, 0, 1, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 1]);
    pixelNumbers.push([1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1]);
    pixelNumbers.push([1, 1, 0, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 1, 0]);
    pixelNumbers.push([1, 0, 0, 1, 0, 1, 1, 1, 1, 0, 0, 1, 0, 0, 1]);
    pixelNumbers.push([1, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 1]);
    pixelNumbers.push([1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1]);
    pixelNumbers.push([1, 1, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0]);
    pixelNumbers.push([1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1]);
    pixelNumbers.push([1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1]);
}

function GlitchTile() {
    this.id = 0;
    this.colorId = 0;
    this.pos = new Vector2(0, 0);
    this.height = 0;
    this.width = 0;
}

function Tile(x, y) {
    this.x = x;
    this.y = y;
}

function Glitch() {
    this.tiles = [];
    this.tilesInRow = 0;
}

function Vector2(x, y) {
    this.x = x;
    this.y = y;
}

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
        if (timers[0] >= 3000 && timers[0] <= 6000) {
            drawGlitchInCanvas();
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

function shiftColorChannels(data, sourceRGBChannel, targetRGBChannel, width, height, seedX, seedY, glitchFactor, lengthFactor) {
    for (var y = 0; y < height; y++) {
        var offsetY = seedY + y;
        if (offsetY >= height) {
            offsetY -= height;
        }
        for (var x = 0; x < width; x++) {
            var offsetX = seedX + x;
            if (offsetX >= width) {
                offsetX -= width;
            }
            var targetPixel = y * width * glitchFactor + x * lengthFactor;
            var sourcePixel = offsetY * width * glitchFactor + offsetX * lengthFactor;
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
    var j = -1;
    for (var i = 0; i < pixelLetter.length; i++) {
        if (i % 3 == 0) {
            j++;
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
    drawPixelWord(externalContext, playButton[0], playButton[1], playButton[2], playButton[5], "white");
    drawPixelWord(externalContext, rulesButton[0], rulesButton[1], rulesButton[2], rulesButton[5], "white");
    var pixelSize = 8;
    drawPixelWord(ctx, "GAME OVER", canvas.width / 2 - 4 * pixelSize * 4, canvas.height / 4 - pixelSize / 2, pixelSize, "white");
    drawPixelWord(ctx, "YOUR SCORE IS " + score, canvas.width / 2 - 4 * pixelSize * 7, canvas.height / 2 - pixelSize / 2, pixelSize, "white");
    drawPixelWord(ctx, "YOUR HIGHSCORE IS " + highscore, canvas.width / 2 - 4 * pixelSize * 9, canvas.height / 4 * 3 - pixelSize / 2, pixelSize, "white");
}

function drawRulesScreen() {
    drawPixelWord(externalContext, playButton[0], playButton[1], playButton[2], playButton[5], "white");
    drawPixelWord(externalContext, rulesButton[0], rulesButton[1], rulesButton[2], rulesButton[5], "white");
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
    for (var i = 0; i < canvas.height; i++) {
        for (var j = 0; j < 10; j++) {
            ctx.beginPath();
            ctx.rect(Math.random() * canvas.width, i, Math.random(), Math.random());
            ctx.fillStyle = "rgb(" + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + ")";
            ctx.fill();
            ctx.closePath();
            ctx.save();
            ctx.restore();
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

function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}
