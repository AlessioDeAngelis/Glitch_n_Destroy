/**
 * Created by a.deangelis on 22/08/2016.
 */

function createNewGlitch(glitchSize) {
    console.log("CREATING A NEW GLITCH");
    glitch = new Glitch();
    var glitchTileX = 0;
    var glitchTileY = 0;
    var tilesInRow = Math.sqrt(glitchSize);
    glitch.tilesInRow = tilesInRow;
    var j = -1;
    for (var i = 0; i < glitchSize; i++) {
        var glitchTile = new GlitchTile();
        if (i % tilesInRow == 0) {
            j++; //this row is full, go to the next one
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

function startGame() {
    console.log("START NEW GAME");
    highscore = localStorage.highscore;
    clearGame();
    if (typeof (highscore) === "undefined") {
        highscore = 0;
    }
    initTimers();
    initMainScreenButtons();
    initQuotes();
    initGlitch(2 * 2);
    initColorOccurrencesArray();
    initPixelLetters();
    generateGlitchWords(1);
    gameLoop();
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

function initGlitch(glitchSize) {
    createNewGlitch(glitchSize);
}


function initTimers() {
    timers.push(0);//used for shuffling the glitch tiles
    timers.push(0);//used for changing the color to match;
    timers.push(0);//used for updating the life points
    timers.push(0);//used for updating the noise change
    timers.push(0);//used for showing the glitch or just the solution
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
    if (isMainScreen || isRulesScreen) {
        if (screenTouched && isPlayButtonSelected(new Vector2(lastScreenTouch.x - externalCanvas.offsetLeft, lastScreenTouch.y - externalCanvas.offsetTop))) {
            isMainScreen = false;
            isGameScreen = true;
            timers[0] = 0;
        }
        if (screenTouched && isRulesButtonSelected(new Vector2(lastScreenTouch.x - externalCanvas.offsetLeft, lastScreenTouch.y - externalCanvas.offsetTop))) {
            isMainScreen = false;
            isRulesScreen = true;
            timers[0] = 0;
        }
    }
    if (isGameScreen) {
        if(isGlitchVisible) {
            updateLifepoints();
        }
        if (lifepoints <= 0) {
            //gameOver
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
            //time to let the glitch being visible again and change the current quote id
            timers[4] = 0;
            isGlitchVisible = true;
            changeCurrentQuoteId();
            timers[0] = 0; // no canvas glitch when you create a new game glitch
        }
        if (isGlitchOver()) {
            isGlitchVisible = false;
            timers[4] = 0;
            initGlitch((glitch.tilesInRow + 1) * (glitch.tilesInRow + 1));
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

function updateOld() {
    if (isMainScreen && !isGameOver && !isGameScreen) {
        updatePlayer(); // I like to move the player in the main screen
        if (enterPressed || screenTouched) {
            isGameOver = false;
            isMainScreen = false;
            isGameScreen = true;
            descriptionTextPos = 0;
        }
    } else if (!isGameOver && isGameScreen) {
        updatePlayer();
        updateGlitch();
        updateColorToMatch();
        //    checkGameover();
    } else {
        if ((enterPressed || screenTouched) && !isGameScreen) {
            isGameOver = false;
            isMainScreen = true;
            isGameScreen = false;
            descriptionTextPos = 0;
            clearGame();
            clearView();
            location.reload(); //TODO: do it better
        }
    }
}

function clearGame() {

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
                    // you touched a wrong tile, you lose lifepoints
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
    //change the color to match
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
    //restore 0 to each
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
    //0 id is not included since should not be matched
    for (var colorId = 1; colorId < glitchColors.length; colorId++) {
        if (colorOccurrencesArray[colorId] > 0) {
            currentGlitchColors.push(colorId);
        }
    }
    //return a random color id
    return currentGlitchColors[Math.floor(Math.random() * (currentGlitchColors.length))];
}

function propagateColorChange(glitchTileId, colorIdToCheck, newColorId) {
    if (typeof (glitch.tiles[glitchTileId]) === "undefined") {
        return;
    }
    if (glitch.tiles[glitchTileId].colorId !== colorIdToCheck || glitch.tiles[glitchTileId].colorId === newColorId) {
        return;
    }
    //gain points for touching a correct tile
    lifepoints++;
    score++;
    //update the occurrences of the glitch colors saved into colorOccurrencesArray
    colorOccurrencesArray[glitch.tiles[glitchTileId].colorId]--;
    colorOccurrencesArray[newColorId]++;
    //update the color
    glitch.tiles[glitchTileId].colorId = newColorId;
    var rowNumber = Math.floor(glitchTileId / glitch.tilesInRow); //row number of the current tile
    //expand in all directions
    //when expanding left or rigth you should check if u are still in the same row
    if (rowNumber === Math.floor((glitchTileId + 1) / glitch.tilesInRow) && glitchTileId + 1 < glitch.tiles.length && glitch.tiles[glitchTileId + 1].colorId === colorIdToCheck) {
        propagateColorChange(glitchTileId + 1, colorIdToCheck, newColorId); //right
    }
    if (rowNumber === Math.floor((glitchTileId - 1) / glitch.tilesInRow) && glitchTileId - 1 >= 0 && glitch.tiles[glitchTileId - 1].colorId === colorIdToCheck) {
        propagateColorChange(glitchTileId - 1, colorIdToCheck, newColorId); //left
    }
    if (glitchTileId + glitch.tilesInRow < glitch.tiles.length && glitch.tiles[glitchTileId + glitch.tilesInRow].colorId === colorIdToCheck) {
        propagateColorChange(glitchTileId + glitch.tilesInRow, colorIdToCheck, newColorId); //bottom
    }
    if (glitchTileId - glitch.tilesInRow >= 0 && glitch.tiles[glitchTileId - glitch.tilesInRow].colorId === colorIdToCheck) {
        propagateColorChange(glitchTileId - glitch.tilesInRow, colorIdToCheck, newColorId); //up
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
    pixelLetters.push([0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1]); //A
    pixelLetters.push([1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0]); //B
    pixelLetters.push([0, 1, 0, 1, 0, 1, 1, 0, 0, 1, 0, 1, 0, 1, 0]); //C
    pixelLetters.push([1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0]); //D
    pixelLetters.push([1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1, 1, 1]); //E
    pixelLetters.push([1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 0]); //F
    pixelLetters.push([0, 1, 0, 1, 0, 1, 1, 0, 0, 1, 0, 1, 0, 1, 1]); //G
    pixelLetters.push([1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1]); //H
    pixelLetters.push([1, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 1]); //I
    pixelLetters.push([0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 0]); //J
    pixelLetters.push([1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1]); //K
    pixelLetters.push([1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 1]); //l
    pixelLetters.push([1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1]); //M
    pixelLetters.push([0, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1]); //N
    pixelLetters.push([1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1]); //O
    pixelLetters.push([0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 0, 0]); //P
    pixelLetters.push([0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 0, 0, 1]); //Q
    pixelLetters.push([0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 0, 1]); //R
    pixelLetters.push([0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0]); //S
    pixelLetters.push([1, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0]); //T
    pixelLetters.push([1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1]); //U
    pixelLetters.push([1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 0]); //V
    pixelLetters.push([1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1]); //W
    pixelLetters.push([1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1]); //X
    pixelLetters.push([1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 0, 0, 1, 0]); //Y
    pixelLetters.push([1, 1, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 1, 1]); //Z

    pixelNumbers.push([0, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 0]);//0
    pixelNumbers.push([0, 1, 0, 1, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 1]);//1
    pixelNumbers.push([1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1]);//2
    pixelNumbers.push([1, 1, 0, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 1, 0]);//3
    pixelNumbers.push([1, 0, 0, 1, 0, 1, 1, 1, 1, 0, 0, 1, 0, 0, 1]);//4
    pixelNumbers.push([1, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 1]);//5
    pixelNumbers.push([1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1]);//6
    pixelNumbers.push([1, 1, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0]);//7
    pixelNumbers.push([1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1]);//8
    pixelNumbers.push([1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1]);//9
}
