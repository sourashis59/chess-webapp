console.log("\nhello");

//*------------------------------- HTML elements -----------------------------------------//
let statusDiv = document.getElementById("statusDiv");
let fenDiv = document.getElementById("fen");
let pgnDiv = document.getElementById("pgn");
let engineStatusTextDiv = document.getElementById('engine-status-text-div')
let newGameWhiteButton = document.getElementById("new-game-white-button");
let newGameBlackButton = document.getElementById("new-game-black-button");
let timeSlider = document.getElementById("time-slider");
let timeSliderValueDiv = document.getElementById("time-slider-value");
let engineThinkingProgressBar = document.getElementById('engine-thinking-progress-bar')
let resignButton = document.getElementById('resign-button')


//*----------------------------- variables ----------------------------------------//
//* config for board ui object
const config = {
  draggable: true,
  position: "start",
  onDragStart: onDragStartHandler,
  onDrop: onDropHandler,
  onSnapEnd: onSnapEndHandler,

  showNotation: "true",
  showErrors: "console",
};

//* board object: used for ui of board
let board = null;
//*game object is used for handling chess logic
let game = new Chess();

//* user is playing white or black?
let currOrientation = "white";

//* used to maintain the progress bar
let progressInterval;

//* socket connection for getting best moves from engine
let engineSocket = null;

/*
* If socket connection is not established yet, then socket.send(message) function throws exception:
* `Uncaught InvalidStateError: Failed to execute 'send' on 'WebSocket': Still in CONNECTING state.`
*
* So When we want to send message through socket, check if connection is established, then only send.
* Otherwise put in the queue, And inside socket.onopen() callback, send the messages from the queue [when connection becomes open]. 
*/
let engineSocketToBeSentMessageQueue = []

function sendEngineSocketMessageWithOpenConnectionChecking(message) {
  if (engineSocket.readyState === WebSocket.OPEN) {
    engineSocket.send(message);
  } else if (engineSocket.readyState === WebSocket.CONNECTING) {
      console.log('WebSocket not open yet. Queuing message.');
      engineSocketToBeSentMessageQueue.push(message);
  } else {
      console.error('WebSocket is not open. Cannot send message.');
  }
}


//*------------------------------------ Event Listners ----------------------------------------//

newGameWhiteButton.addEventListener("click", function () {
  console.log("\nNewGameWhiteButton clicked")
  playNewGameAsWhite();
});

newGameBlackButton.addEventListener("click", function () {
  console.log("\nNewGameBlackButton clicked")
  playNewGameAsBlack();
});

timeSlider.addEventListener("input", function () {
  timeSliderValueDiv.textContent = this.value;
});

resignButton.addEventListener('click', function() {
  if (currOrientation === 'white') {
    playNewGameAsWhite();
  } else {
    playNewGameAsBlack();
  }
})


//*-------------------------------------------- functions -------------------------------------------//
function showFireExplosion() {
  let fireExplosion = document.getElementById('fire-explode');
  fireExplosion.style.display = 'block';
  playFireExplodeAudio();
  setTimeout(function() {
    fireExplosion.style.display = 'none';

    //* stop fire explode audio
    let fireAudio = document.getElementById('fire-explode-audio');
    fireAudio.pause();
    fireAudio.currentTime = 0;
  }, 2000); //* Hide after 2 second
}


function playPieceMoveSound() {
  document.getElementById('piece-move-audio').play();
}


function playFireExplodeAudio() {
  // Stop all audio elements
  let audioElements = document.getElementsByTagName('audio');
  for (let i = 0; i < audioElements.length; i++) {
    audioElements[i].pause();
    audioElements[i].currentTime = 0; // Reset audio to start position
  }
  document.getElementById('fire-explode-audio').play();
}


function parseAlgebraicMove(moveString) {
  let res = {
    from: moveString[0] + moveString[1],
    to: moveString[2] + moveString[3],
  }

  if (moveString.length > 4) {
    // TODO: 
    res.promotion = moveString[4].toLowerCase()
  } 
  
  return res;
}


function updateStatusDivs() {
  var statusString = "";
  var moveColor = "White";
  if (game.turn() === "b") {
    moveColor = "Black";
  }

  if (game.in_checkmate()) {
    statusString = "Game over[" + moveColor + " is checkmated]";
    showFireExplosion()
  } else if (game.in_draw()) {
    statusString = "Game over[Draw]";
  } else {
    statusString = moveColor + " to move";
    if (game.in_check()) {
      statusString += ", " + moveColor + " is in check!";
    }
  }

  console.log("statusString= " + statusString);
  console.log("statusDiv: " + statusDiv);
  statusDiv.innerHTML = "      " + statusString;
  fenDiv.innerHTML = "      " + game.fen();
  pgnDiv.innerHTML = "      " + game.pgn();
}




//let changePlayerButton = document.getElementById("change-player-button");
//
//changePlayerButton.addEventListener("click", function(){
//  currOrientation = (currOrientation === 'white') ? 'black' : 'white';
//  board.orientation(currOrientation);
//});


function startProgressUntilTime(timeInSeconds) {
  var progressBar = document.getElementById('engine-thinking-progress-bar');
  var currentValue = 0;
  //* Milliseconds
  var interval = 50; 
  //* Calculate total steps
  var totalSteps = timeInSeconds * 1000 / interval; 
  
  //* Clear any existing progress interval
  clearInterval(progressInterval);
  
  //* Update progress bar at regular intervals
  progressInterval = setInterval(function() {
      currentValue++;
      var progressPercentage = (currentValue / totalSteps) * 100;
      progressBar.style.width = progressPercentage + "%";
      progressBar.setAttribute("aria-valuenow", progressPercentage);
      
      if (currentValue >= totalSteps) {
          //* clearInterval(progressInterval); // Stop updating progress when time is reached
          resetProgressBar()
      }
  }, interval);
}


function resetProgressBar() {
  var progressBar = document.getElementById('engine-thinking-progress-bar');
  progressBar.style.width = "0%";
  progressBar.setAttribute("aria-valuenow", "0");
  //* Stop the progress interval
  clearInterval(progressInterval); 
}










function playNewGameAsWhite() {
  reset();
  board.orientation("white");
  currOrientation = 'white'
}


function playNewGameAsBlack() {
  reset();
  board.orientation("black");
  currOrientation = 'black'

  requestEngineMove()
}





/*
 * Documentattion:
 * -----------------------------------------
 * Fires when a piece is picked up.
 * The first argument to the function is the source of the piece, the second argument is the piece,
 * the third argument is the current position on the board, and the fourth argument is the current orientation.
 * The drag action is prevented if the function returns false.
 *
 * Example:
 * - source (algebraic notation) -> examples: a1, c2, g5
 * - piece (some weird notation {'w' or 'b'} {pieceType in capital})
 *        -> example: bP(black pawn), wN(white knight), wK(white king),...
 * - position -> fen
 * - orientation -> white or black (from whose pov we are seeing the board)
 *
 */
function onDragStartHandler(source, piece, position, orientation) {
  //* do not let the user drag any piece, if game is over
  if (game.game_over()) 
    return false;

  if (
    //*only let user pick up pieces for the side to move
    ((game.turn() === "w" && piece.search(/^b/) !== -1) ||
    (game.turn() === "b" && piece.search(/^w/) !== -1))
    ||
    //* if it's engine's turn, and user is trying to move engine's piece
    ((currOrientation === 'white' && piece.search(/^b/) !== -1) || (currOrientation === "black" && piece.search(/^w/) !== -1))
  ) {
    return false;
  }
}


/*
 * Fires when a piece is dropped.
 * The first argument to the function is the source of the dragged piece,
 * the second argument is the target of the dragged piece, the third argument is the piece,
 * the fourth argument is the new position once the piece drops,
 * the fifth argument is the old position before the piece was picked up,
 * and the sixth argument is the current orientation.
 *
 * If 'snapback' is returned from the function, the piece will return to it's source square.
 *
 * If 'trash' is returned from the function, the piece will be removed
 *
 * Example:
 * - source, target: d2, d4, e1, g4
 * - Piece: wP, bK, bQ
 * - newPosition, oldPosition(fen string): rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR
 * - Orientation: white, black
 *
 */
function onDropHandler(source, target) {
  //* see if the move is legal
  var move = game.move({
    from: source,
    to: target,
    promotion: "q", // TODO: for now always promote to a queen for example simplicity
  });

  //* for illegal move, return 'snapback' -> this will snap the piece back
  //* to the original square from where drag started
  if (move === null) return "snapback";

  //* play piece move audio
  playPieceMoveSound();

  requestEngineMove();
}



function requestEngineMove() {
  console.log("making request, curr time = " + new Date());
  updateStatusDivs();

  let moveTimeInSeconds = timeSlider.value;
  
  //*show progress bar and remove text
  engineStatusTextDiv.innerHTML = ""
  startProgressUntilTime(parseInt(moveTimeInSeconds))
  
  const request = {
    'fen': `${game.fen()}`,
    'moveTime': `${moveTimeInSeconds}`
  }
  console.log("Request best move: ")
  console.log(request);

  //* send request message for best move
  // engineSocket.send(JSON.stringify(request));
  sendEngineSocketMessageWithOpenConnectionChecking(JSON.stringify(request));
}





//* update the board position after the piece snap
//* for castling, en passant, pawn promotion
function onSnapEndHandler() {
  board.position(game.fen());
}


function reset() {
  //*enable buttons

  game = new Chess();
  board = Chessboard("myBoard", config);

  resetProgressBar();
  updateStatusDivs();

  timeSliderValueDiv.textContent = timeSlider.value;
  engineStatusTextDiv.innerHTML = ""


  //* we need to reset the socket connection, otherwise for prev socket
  //* there might be one request already running on server chess engine, which may take time.
  //* so better create new connection and allocate new engine process.
  //* ----> One engine / match
  if (engineSocket !== null) engineSocket.close();
  //* clear queue
  engineSocketToBeSentMessageQueue = []
  engineSocket = new WebSocket("/chess");
  assignHandlersForEngineSocket();
}



function assignHandlersForEngineSocket() {
  engineSocket.onopen = function(event) {
    console.log("Connection established!");
    
    //* read the comments for variable definition of `engineSocketToBeSentMessageQueue`
    while (engineSocketToBeSentMessageQueue.length > 0) {
      engineSocket.send(engineSocketToBeSentMessageQueue.shift());
    }
  };
  
  engineSocket.onmessage = function(event) {
    let response = event.data
    console.log("Received message on socket: ", response);
    console.log("Curr time = " + new Date());
    console.log("Game.fen(): " + game.fen());
  
    response = JSON.parse(response)
  
    //*TODO:socket: if response.status is not SUCCESS, then show error
    //* if the response is not for the current state, then ignore
    if (game.fen() !== response['fen']) {
      console.log("Response not for current state, response: " + response + ", game.fen(): " + game.fen())
      return;
    }
  
    const bestMove = response['bestMove']
    //*TODO: parse move properly in case of promotion
    if (game.move(parseAlgebraicMove(bestMove)) === null) {
      console.log(".move() failed!!!!");
    }
  
    //* update ui board
    board.position(game.fen());
  
    //* play piece move audio
    playPieceMoveSound();
  
    //* hide spinner and show engine output
    engineStatusTextDiv.innerHTML = bestMove
  
    //* update the divs with status
    updateStatusDivs();
  };
  
  engineSocket.onclose = function(event) {
    console.log("Connection closed.");
  };
  
  engineSocket.onerror = function(error) {
    console.error("WebSocket error:", error);
      
    //*hide spinner
    engineStatusTextDiv.innerHTML = "Error: " + error;
  };  
}






reset();



