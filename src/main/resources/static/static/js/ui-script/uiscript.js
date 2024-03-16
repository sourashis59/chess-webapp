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
let currOrientation = "white";

//* used to store the connection for getting best move
let playEngineMoveGetRequestXHR;

//* used to maintain the progress bar
let progressInterval;





//*------------------------------------ Event Listners ----------------------------------------//

newGameWhiteButton.addEventListener("click", function () {
  reset();
});

newGameBlackButton.addEventListener("click", function () {
  reset();
  board.orientation("black");
  playEngineMove();
});

timeSlider.addEventListener("input", function () {
  timeSliderValueDiv.textContent = this.value;
});




//*-------------------------------------------- functions -------------------------------------------//

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

  //* only let user pick up pieces for the side to move
  if (
    (game.turn() === "w" && piece.search(/^b/) !== -1) ||
    (game.turn() === "b" && piece.search(/^w/) !== -1)
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

  //*TODO: when engine is thinking, dont let user play on it's behalf
  //*for now cancel last move request
  if (playEngineMoveGetRequestXHR) {
    playEngineMoveGetRequestXHR.abort()
  }

  playEngineMove();
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


function playEngineMove() {
  console.log("\n\nmaking request, curr time = " + new Date());

  let moveTimeInSeconds = timeSlider.value;
  //* time out limit = (moveTime + 5) seconds
  let timeOut = (parseInt(moveTimeInSeconds) + 5) * 1000;
  let url = "/api/bestmove?fen=" + game.fen() + "&movetime=" + moveTimeInSeconds;

  updateStatusDivs();
   
  //*show progress bar and remove text
  engineStatusTextDiv.innerHTML = ""
  startProgressUntilTime(parseInt(moveTimeInSeconds))
  
  //* get best move
  playEngineMoveGetRequestXHR = $.ajax(
  {
    url: url,
    method: 'GET',
    timeout: timeOut,

    success: function (response) {
      console.log("got response for request, curr time = " + new Date());
      console.log("response: " + response);
      console.log("\ngame.fen(): " + game.fen());
  
      //*TODO: parse move properly in case of promotion
      if (
        game.move(parseAlgebraicMove(response)) === null
      ) {
        console.log(".move() failed!!!!");
      }
      console.log("game.fen(): " + game.fen());
  
      //* update ui board
      board.position(game.fen());
  
      //* hide spinner and show engine output
      engineStatusTextDiv.innerHTML = response

      //* update the divs with status
      updateStatusDivs();
    },

    error: function(xhr, status, error) {
      // Handle error
      console.error("Error:", error);
  
      //*hide spinner
      engineStatusTextDiv.innerHTML = "Error: " + error;
  
    }
    
  });

  

}


/*
 * Call api to get best move
 * Returns null in case of error
 */
function getBestMoveFromFen(fen) {}


//* update the board position after the piece snap
//* for castling, en passant, pawn promotion
function onSnapEndHandler() {
  board.position(game.fen());
}


function updateStatusDivs() {
  var statusString = "";
  var moveColor = "White";
  if (game.turn() === "b") {
    moveColor = "Black";
  }

  if (game.in_checkmate()) {
    statusString = "Game over[" + moveColor + " is checkmated]";
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




function reset() {
  //*enable buttons

  game = new Chess();
  board = Chessboard("myBoard", config);

  resetProgressBar();
  updateStatusDivs();

  //* if we requested a best move from server,
  //* then we need to cancel the request
  if (playEngineMoveGetRequestXHR) {
    playEngineMoveGetRequestXHR.abort();
  }

  timeSliderValueDiv.textContent = timeSlider.value;
  engineStatusTextDiv.innerHTML = ""
}






reset();



