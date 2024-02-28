console.log("\nhello")
// NOTE: this example uses the chess.js library:
// https://github.com/jhlywa/chess.js

var board = null
var game = new Chess()
var $status = $('#status')
var $fen = $('#fen')
var $pgn = $('#pgn')

function onDragStartHandler (source, piece, position, orientation) {
  // do not pick up pieces if the game is over
  if (game.game_over()) return false

  // only pick up pieces for the side to move
  if ((game.turn() === 'w' && piece.search(/^b/) !== -1) ||
      (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
    return false
  }
}



function onDropHandler (source, target) {  
  // see if the move is legal
  var move = game.move({
    from: source,
    to: target,
    promotion: 'q' // NOTE: always promote to a queen for example simplicity
  })

  // illegal move
  if (move === null) return 'snapback'

  // call the API
//  $.post('/makemove', {'fen' : game.fen()}, function(data) {
//    console.log(data)
//
//    // update game fen
//    game.load(data.fen)
//
//    // update ui board
//    board.position(data.fen)
//  })

    $.get("/api/bestmove?fen=" + game.fen(), function(response) {
        console.log(response)
        console.log("\ngame.fen(): " + game.fen())
        if (game.move({from: response[0] + response[1], to: response[2] + response[3]}) === null) {
            console.log(".move() failed!!!!")
        }
        console.log("game.fen(): " + game.fen())
        // update game fen
//        game.load(data.fen)

        // update ui board
        board.position(game.fen())
    }).fail(function(xhr, status, error) {
        // Handle error
        console.error("Error:", error);
    });

  updateStatus()
}

// update the board position after the piece snap
// for castling, en passant, pawn promotion
function onSnapEndHandler () {
  board.position(game.fen())
}

function updateStatus () {
  var status = ''

  var moveColor = 'White'
  if (game.turn() === 'b') {
    moveColor = 'Black'
  }

  // checkmate?
  if (game.in_checkmate()) {
    status = 'Game over, ' + moveColor + ' is in checkmate.'
  }

  // draw?
  else if (game.in_draw()) {
    status = 'Game over, drawn position'
  }

  // game still on
  else {
    status = moveColor + ' to move'

    // check?
    if (game.in_check()) {
      status += ', ' + moveColor + ' is in check'
    }
  }

  $status.html(status)
  $fen.html(game.fen())
  $pgn.html(game.pgn())
}

var config = {
  draggable: true,
  position: 'start',
  onDragStart: onDragStartHandler,
  onDrop: onDropHandler,
  onSnapEnd: onSnapEndHandler
}
board = Chessboard('myBoard', config)

updateStatus()