console.log("\nhello")

let board = null
let statusDiv = document.getElementById('statusDiv')
let fen = document.getElementById('fen')
let pgn = document.getElementById('pgn')
let game = new Chess()

let playEngineMoveGetRequestXHR;


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
function onDragStartHandler (source, piece, position, orientation) {
  //* do not let the user drag any piece, if game is over
  if (game.game_over()) return false

  //* only let user pick up pieces for the side to move
  if ((game.turn() === 'w' && piece.search(/^b/) !== -1) ||
      (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
    return false
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
function onDropHandler (source, target) {  
  //* see if the move is legal
  var move = game.move({
    from: source,
    to: target,
    promotion: 'q' // TODO: for now always promote to a queen for example simplicity
  })

  //* for illegal move, return 'snapback' -> this will snap the piece back
  //* to the original square from where drag started
  if (move === null) 
      return 'snapback'

  playEngineMove();
  //* update the divs with status
  updateStatusDivs()
}


function playEngineMove() {
  console.log("\n\nmaking request, curr time = " + (new Date()))

  let url = "/api/bestmove?fen=" + game.fen() + "&movetime=" + timeSlider.value;
  //* get best move
  playEngineMoveGetRequestXHR = $.get(url, function (response) {
    console.log("got response for request, curr time = " + (new Date()))
    console.log("response: " + response)
    console.log("\ngame.fen(): " + game.fen())

    //*TODO: parse move properly in case of promotion
    if (game.move({ from: response[0] + response[1], to: response[2] + response[3] }) === null) {
      console.log(".move() failed!!!!")
    }
    console.log("game.fen(): " + game.fen())

    // update ui board
    board.position(game.fen())
  }).fail(function (xhr, status, error) {
    // Handle error
    console.error("Error:", error);
  });

}


/*
 * Call api to get best move
 * Returns null in case of error
 */
function getBestMoveFromFen(fen) {
  
}


// update the board position after the piece snap
// for castling, en passant, pawn promotion
function onSnapEndHandler () {
  board.position(game.fen())
}

function updateStatusDivs () {
  var statusString = ''

  var moveColor = 'White'
  if (game.turn() === 'b') {
    moveColor = 'Black'
  }

  if (game.in_checkmate()) {
    statusString = 'Game over, ' + moveColor + ' is in checkmate.'
  } else if (game.in_draw()) {
    statusString = 'Game over, drawn position'
  } else {
    statusString = moveColor + ' to move'

    if (game.in_check()) {
      statusString += ', ' + moveColor + ' is in check'
    }
  }

  console.log("statusString= " + statusString)
  console.log("statusDiv: " + statusDiv)
  statusDiv.innerHTML = "      " + (statusString)
  fen.innerHTML = "      " + (game.fen())
  pgn.innerHTML = "      " + (game.pgn())
}








let currOrientation = 'white'

let newGameWhiteButton = document.getElementById("new-game-white-button")
let newGameBlackButton = document.getElementById("new-game-black-button")

let timeSlider = document.getElementById('time-slider')
let timeSliderValueDiv = document.getElementById('time-slider-value')

//let changePlayerButton = document.getElementById("change-player-button");
//
//changePlayerButton.addEventListener("click", function(){
//  currOrientation = (currOrientation === 'white') ? 'black' : 'white';
//  board.orientation(currOrientation);
//});



function reset() {
  //enable buttons

  game = new Chess()

  var config = {
    draggable: true,
    position: 'start',
    onDragStart: onDragStartHandler,
    onDrop: onDropHandler,
    onSnapEnd: onSnapEndHandler,

    showNotation: 'true',
    showErrors: 'console'
  }
  board = Chessboard('myBoard', config)

  updateStatusDivs()

  //* if we requested a best move from server,
  //* then we need to cancel the request
  if (playEngineMoveGetRequestXHR) {
    playEngineMoveGetRequestXHR.abort()
  }

  timeSliderValueDiv.textContent = timeSlider.value;
}


newGameWhiteButton.addEventListener('click', function() {
  reset()
})


newGameBlackButton.addEventListener('click', function() {
  reset()
  board.orientation('black')
  playEngineMove()
})

timeSlider.addEventListener("input", function() {
  timeSliderValueDiv.textContent = this.value;
});



reset()