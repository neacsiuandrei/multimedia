var fileElem = document.getElementById('fileElem');
    fileElem.addEventListener('change', handleImage, false);
var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext('2d');
var img = new Image();
 
var puzzleStage;
var puzzlePieces;
var puzzleWidth;
var puzzleHeight
var pieceWidth;
var pieceHeight;
var currentPiece;
var currentDropPiece;
var mouse;


function handleImage(e){
    var reader = new FileReader();
    reader.onload = function(event){
        img.onload = function(){
            ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height);
        }
        img.src = event.target.result;
    }
    reader.readAsDataURL(e.target.files[0]);
    img.addEventListener('load',onImage,false);
}

document.getElementById('fileElem').addEventListener('change', function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}, false);

function onImage(e){
    pieceWidth = Math.floor(img.width / 4)
    pieceHeight = Math.floor(img.height / 4)
    puzzleWidth = pieceWidth * 4;
    puzzleHeight = pieceHeight * 4;
    setCanvas();
    initPuzzle();
}

function setCanvas(){
    canvas = document.getElementById('myCanvas');
    puzzleStage = canvas.getContext('2d');
    canvas.width = puzzleWidth;
    canvas.height = puzzleHeight;
}

function initPuzzle(){
    puzzlePieces = [];
    mouse = {x:0,y:0};
    currentPiece = null;
    currentDropPiece = null;
    puzzleStage.drawImage(img, 0, 0, puzzleWidth, puzzleHeight, 0, 0, puzzleWidth, puzzleHeight);
    createPuzzle();
}

function createPuzzle(){
    var i;
    var piece;
    var xPos = 0;
    var yPos = 0;
    for(i = 0;i < 16;i++){
        piece = {};
        piece.sx = xPos;
        piece.sy = yPos;
        puzzlePieces.push(piece);
        xPos += pieceWidth;
        if(xPos >= puzzleWidth){
            xPos = 0;
            yPos += pieceHeight;
        }
    }
    document.onmousedown = shufflePuzzle;
}

function shufflePuzzle(){
    puzzlePieces = shuffleArray(puzzlePieces);
    puzzleStage.clearRect(0,0,puzzleWidth,puzzleHeight);
    var i;
    var piece;
    var xPos = 0;
    var yPos = 0;
    for(i = 0;i < puzzlePieces.length;i++){
        piece = puzzlePieces[i];
        piece.xPos = xPos;
        piece.yPos = yPos;
        puzzleStage.drawImage(img, piece.sx, piece.sy, pieceWidth, pieceHeight, xPos, yPos, pieceWidth, pieceHeight);
        puzzleStage.strokeRect(xPos, yPos, pieceWidth, pieceHeight);
        xPos += pieceWidth;
        if(xPos >= puzzleWidth){
            xPos = 0;
            yPos += pieceHeight;
        }
    }
    document.onmousedown = onPuzzleClick;
}

function shuffleArray(o){
    for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
}

function getMousePos(canvas, e) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }
function onPuzzleClick(e){

    mouse = getMousePos(canvas, e);

    currentPiece = checkPieceClicked();
    if(currentPiece != null){
        puzzleStage.clearRect(currentPiece.xPos, currentPiece.yPos, pieceWidth, pieceHeight);
        puzzleStage.save();
        puzzleStage.globalAlpha = .9;
        puzzleStage.drawImage(img, currentPiece.sx, currentPiece.sy, pieceWidth, pieceHeight, mouse.x - (pieceWidth / 2), mouse.y - (pieceHeight / 2), pieceWidth, pieceHeight);
        puzzleStage.restore();
        document.onmousemove = updatePuzzle;
        document.onmouseup = pieceDropped;
    }
}

function checkPieceClicked(){
    var i;
    var piece;
    for(i = 0;i < puzzlePieces.length;i++){
        piece = puzzlePieces[i];
        if(mouse.x < piece.xPos || mouse.x > (piece.xPos + pieceWidth) || mouse.y < piece.yPos || mouse.y > (piece.yPos + pieceHeight)){
            
        }
        else{
            return piece;
        }
    }
    return null;
}

function updatePuzzle(e){
    currentDropPiece = null;
    mouse = getMousePos(canvas, e);
    puzzleStage.clearRect(0,0, puzzleWidth, puzzleHeight);
    var i;
    var piece;
    for(i = 0;i < puzzlePieces.length;i++){
        piece = puzzlePieces[i];
        if(piece == currentPiece){
            continue;
        }
        puzzleStage.drawImage(img, piece.sx, piece.sy, pieceWidth, pieceHeight, piece.xPos, piece.yPos, pieceWidth, pieceHeight);
        puzzleStage.strokeRect(piece.xPos, piece.yPos, pieceWidth, pieceHeight);
        if(currentDropPiece == null){
            if(mouse.x < piece.xPos || mouse.x > (piece.xPos + pieceWidth) || mouse.y < piece.yPos || mouse.y > (piece.yPos + pieceHeight)){
                
            }
            else{
                currentDropPiece = piece;
                puzzleStage.save();
                puzzleStage.globalAlpha = .4;
                puzzleStage.fillStyle = '#00ff44';
                puzzleStage.fillRect(currentDropPiece.xPos, currentDropPiece.yPos, pieceWidth, pieceHeight);
                puzzleStage.restore();
            }
        }
    }
    puzzleStage.save();
    puzzleStage.globalAlpha = .6;
    puzzleStage.drawImage(img, currentPiece.sx, currentPiece.sy, pieceWidth, pieceHeight, mouse.x - (pieceWidth / 2), mouse.y - (pieceHeight / 2), pieceWidth, pieceHeight);
    puzzleStage.restore();
    puzzleStage.strokeRect( mouse.x - (pieceWidth / 2), mouse.y - (pieceHeight / 2), pieceWidth, pieceHeight);
}

function pieceDropped(e){
    document.onmousemove = null;
    document.onmouseup = null;
    if(currentDropPiece != null){
        var tmp = {xPos:currentPiece.xPos, yPos:currentPiece.yPos};
        currentPiece.xPos = currentDropPiece.xPos;
        currentPiece.yPos = currentDropPiece.yPos;
        currentDropPiece.xPos = tmp.xPos;
        currentDropPiece.yPos = tmp.yPos;
    }
    resetPuzzleAndCheckWin();
}

function resetPuzzleAndCheckWin(){
    puzzleStage.clearRect(0,0, puzzleWidth, puzzleHeight);
    var gameWin = true;
    var i;
    var piece;
    for(i = 0;i < puzzlePieces.length;i++){
        piece = puzzlePieces[i];
        puzzleStage.drawImage(img, piece.sx, piece.sy, pieceWidth, pieceHeight, piece.xPos, piece.yPos, pieceWidth, pieceHeight);
        puzzleStage.strokeRect(piece.xPos, piece.yPos, pieceWidth, pieceHeight);
        if(piece.xPos != piece.sx || piece.yPos != piece.sy){
            gameWin = false;
        }
    }
    if(gameWin){
        setTimeout(gameOver,500);
    }
}

function gameOver(){
    document.onmousedown = null;
    document.onmousemove = null;
    document.onmouseup = null;
	puzzleStage.clearRect(0,0, puzzleWidth, puzzleHeight);
    initPuzzle();
}