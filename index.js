const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;

const board = [];
const bgm = document.createElement('audio');
const breakSound = document.createElement('audio');
const drop = document.createElement('audio');
let rotatedShape;
let isPaused = false;

bgm.setAttribute('src', './asserts/Tetris.mp3');
bgm.muted = true;


breakSound.setAttribute('src', './asserts/breakSound.mp3');
breakSound.muted = true;

drop.setAttribute('src', './asserts/drop.mp3');
drop.muted = true;


let statValues = {
    score: 0,
    lines: 0
};

function updateStat(key, value){
    const element = document.getElementById(key);
    if(element){
        element.textContent = value;
    }
}

let stat = new Proxy(statValues, {
    set: (target, key, value) => {
        target[key] = value;
        updateStat(key, value);
        return true;
    },
});








for(let row = 0; row < BOARD_HEIGHT; row++){
    board[row] = [];
    for(let col = 0; col < BOARD_WIDTH; col ++){
        board[row][col] = 0;
    }
}

const tetrominoes = [
    {
        shape: [
            [1,1],
            [1,1]
        ],
        color: '#ffd800'
    },
    {
        shape: [
            [0,2,0],
            [2,2,2]
        ],
        color: "#7925dd",
    },
    {
        shape: [
            [0,3,3], 
            [3,3,0]
        ],
        color: 'orange'
    },
    {
        shape: [
            [4,4,0],
            [0,4,4]
        ],
        color:'red'
    },
    {
        shape: [
            [5,0,0],
            [5,5,5]
        ],
        color: 'green'
    },
    {
        shape:[
            [0,0,6],
            [6,6,6]
        ],
        color: "#ff6400"

    },
    {
        shape: [
            [7,7,7,7]
        ],
        color:"#00b5ff"
    }

];


function randomTetromino(){
    const index = Math.floor(Math.random() * tetrominoes.length);
    const tetromino = tetrominoes[index];

    return {
        shape: tetromino.shape,
        color: tetromino.color,
        row: 0,
        col: Math.floor(Math.random() * (BOARD_WIDTH - tetromino.shape[0].length + 1)),
    };
}

let currentTetromino = randomTetromino();
let currentGhostTetromino;


function drawTetromino() {
    const shape = currentTetromino.shape;
    const color = currentTetromino.color;
    const row = currentTetromino.row;
    const col = currentTetromino.col;
  
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c]) {
          const block = document.createElement("div");
          block.classList.add("block");
          block.style.backgroundColor = color;
          block.style.top = (row + r) * 24 + "px";
          block.style.left = (col + c) * 24 + "px";
          block.setAttribute("id", `block-${row + r}-${col + c}`);
          document.getElementById("game_board").appendChild(block);
        }
      }
    }


  }

// erase tetromino from board
function eraseTetromino() {
  for (let i = 0; i < currentTetromino.shape.length; i++) {
    for (let j = 0; j < currentTetromino.shape[i].length; j++) {
      if (currentTetromino.shape[i][j] !== 0) {
        let row = currentTetromino.row + i;
        let col = currentTetromino.col + j;
        let block = document.getElementById(`block-${row}-${col}`);

        if (block) {
          document.getElementById("game_board").removeChild(block);
        }
      }
    }
  }
}

function canTetrominoMove(rowOffset, colOffset){
    for(let i = 0; i < currentTetromino.shape.length; i++){
        for(let j = 0; j < currentTetromino.shape[i].length; j++){
            if(currentTetromino.shape[i][j] != 0){
                let row = currentTetromino.row + i + rowOffset;
                let col = currentTetromino.col + j + colOffset;

                if(row >= BOARD_HEIGHT || col < 0 || col >= BOARD_WIDTH || (row >= 0 && board[row][col] != 0)){
                    return false;
                }
            }
            
        }    
    }

    return true;
}




function cantetrominoRotate(){
    for(let i = 0; i < rotatedShape.length; i ++){
        for(let j = 0; j < rotatedShape[i].length; j++){
            if(rotatedShape[i][j] != 0){
                let row = currentTetromino.row + i;
                let col = currentTetromino.col + j;

                if(row >= BOARD_HEIGHT || col < 0 || col >= BOARD_WIDTH || (row >= 0 && board[row][col] != 0)){
                    return false;
                }

            }
        }
    }
    return true;
}

function lockTetromino(){
    for(let i = 0; i < currentTetromino.shape.length; i ++){
        for(let j = 0; j < currentTetromino.shape[i].length; j ++){
            if(currentTetromino.shape[i][j] != 0){
                let row = currentTetromino.row + i;
                let col = currentTetromino.col + j;
                board[row][col] = currentTetromino.color;
            }
        }
    }

    // clear row
    let rowsCleared = clearRows();
    
    if(rowsCleared > 0){
        // update Score

       
       
        if(rowsCleared == 1){
            stat.score += 100;

        }else if(rowsCleared == 2){
            stat.score += 300;
        }else if(rowsCleared == 3){
            stat.score += 500;
        }else{
            stat.score += 800;
        }
        
    }
    currentTetromino = randomTetromino();

    if (checkGameOver()) {
        gameOver();
    }

}

function checkGameOver() {
    // Check if the new Tetromino overlaps with existing blocks
    for (let i = 0; i < currentTetromino.shape.length; i++) {
        for (let j = 0; j < currentTetromino.shape[i].length; j++) {
            if (currentTetromino.shape[i][j] !== 0) {
                let row = currentTetromino.row + i;
                let col = currentTetromino.col + j;
                if (row >= 0 && board[row][col] !== 0) {
                    return true;
                }
            }
        }
    }
    return false;
}


let gameInterval;

function gameOver() {
    clearInterval(gameInterval); // Stop the game loop
    alert("Game Over!"); // Display game over message
    // Optionally reset the game state or provide options to restart
    
}





function clearRows() {
    let rowsCleared = 0;
  
   
    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
      let rowFilled = true;
  
      for (let x = 0; x < BOARD_WIDTH; x++) {
        if (board[y][x] === 0) {
          rowFilled = false;
          break;
        }
      }
  
      if (rowFilled) {
        breakSound.muted = false;
        breakSound.play();
        rowsCleared++;
  

        for (let yy = y; yy > 0; yy--) {
          for (let x = 0; x < BOARD_WIDTH; x++) {
            board[yy][x] = board[yy - 1][x];
          }
        }
  
        for (let x = 0; x < BOARD_WIDTH; x++) {
          board[0][x] = 0;
        }
        document.getElementById("game_board").innerHTML = "";
        for (let row = 0; row < BOARD_HEIGHT; row++) {
          for (let col = 0; col < BOARD_WIDTH; col++) {
            if (board[row][col]) {
              const block = document.createElement("div");
              block.classList.add("block");
              block.style.backgroundColor = board[row][col];
              block.style.top = row * 24 + "px";
              block.style.left = col * 24 + "px";
              block.setAttribute("id", `block-${row}-${col}`);
              document.getElementById("game_board").appendChild(block);
            }
          }
        }
  
        y++;
      }

    }

    
    stat.lines += rowsCleared;
    return rowsCleared;
  }

function rotateTetromino(){
    rotatedShape = [];
    for(let i = 0; i < currentTetromino.shape[0].length; i++ ){
        let row = [];
        for(let j = currentTetromino.shape.length-1; j >= 0; j--){
            row.push(currentTetromino.shape[j][i]);
        }

        rotatedShape.push(row);
    }
    if(cantetrominoRotate()){
        eraseTetromino();
        currentTetromino.shape = rotatedShape;
        drawTetromino();

        moveGhostTetromino();
      
    }
   
}



function moveTetromino(direction){
    let row = currentTetromino.row;
    let col = currentTetromino.col;

    
    if(direction == 'left'){
        if(canTetrominoMove(0,-1)){
            eraseTetromino();
            col -= 1;
            currentTetromino.col = col;
            currentTetromino.row = row;
            drawTetromino();
        }

    }else if(direction == 'right'){
        if(canTetrominoMove(0,1)){
            eraseTetromino();
            col += 1;
            currentTetromino.col = col;
            currentTetromino.row = row;
            drawTetromino();
        }
    }else{
        //down
        if(canTetrominoMove(1,0)){
            eraseTetromino();
            row ++;
            currentTetromino.col = col;
            currentTetromino.row = row;
            drawTetromino(); 

        }else{
            lockTetromino();
        }
    
    }
    moveGhostTetromino();

}

drawTetromino();



    



// draw Ghost
function drawGhostTetromino(){

    const shape = currentGhostTetromino.shape;
    const color = 'rgba(255,255,255,0.5)';
    const row = currentGhostTetromino.row;
    const col = currentGhostTetromino.col;

    for(let r = 0; r < shape.length; r ++){
        for(let c = 0; c < shape[r].length; c++){
            if(shape[r][c]){
                const block = document.createElement('div');
                block.classList.add('ghost');
                block.style.backgroundColor = color;
                block.style.top = (row + r) * 24 + 'px';
                block.style.left = (col + c) * 24 + 'px';
                block.setAttribute('id', 'ghost-${row + r}-${col + c}');
                document.getElementById('game_board').appendChild(block);


            }
        } 
    }
}

function eraseGhostTetromino(){
    const ghost = document.querySelectorAll('.ghost');
    for(let i = 0; i < ghost.length; i ++){
        ghost[i].remove();
    }
}

function canGhostTetromino(rowOffset, colOffset){
    for(let i = 0; i < currentGhostTetromino.shape.length; i ++){
        for(let j = 0; j < currentGhostTetromino.shape[i].length; j ++){
            if(currentGhostTetromino.shape[i][j] != 0){
                let row = currentGhostTetromino.row + i + rowOffset;
                let col = currentGhostTetromino.col + j + colOffset;

                if(row >= BOARD_HEIGHT || col < 0 || col >= BOARD_WIDTH || (row >= 0 && board[row][col] != 0)){
                    return false;
                }
            }
        }
    }

    return true;
}

function moveGhostTetromino(){
    eraseGhostTetromino();


    currentGhostTetromino = {...currentTetromino};

    while(canGhostTetromino(1,0)){
        currentGhostTetromino.row ++;

    }

    drawGhostTetromino();

}




const soundButton = document.querySelector('button');

soundButton.addEventListener('click', () =>{
    bgm.play();
    bgm.muted = false;
    
    
});


function dropTetromino(){
    let row = currentTetromino.row;
    let col = currentTetromino.col;

    drop.muted = false;
    drop.play();

    while(canTetrominoMove(1,0)){
        eraseTetromino();
        row ++;
        currentTetromino.col = col;
        currentTetromino.row = row;
        drawTetromino();

    }
    lockTetromino();
}

document.addEventListener('keydown', handleKeyPress);


function handleKeyPress(event){
    if(isPaused){
        return;
    }
    switch(event.keyCode){
        case 37 : //left arrow
            moveTetromino('left');
            break;
        case 39 : //right arrow
            moveTetromino('right');
            break;
        case 40 : //down arrow
            moveTetromino('down');
            break;
        case 38 : //up arrow
            //rotate
            rotateTetromino();
            break;
        case 32 : // space bar
            //drop
            dropTetromino();
            break;
    }   
}



gameInterval = setInterval(() => moveTetromino('down'), 700);


