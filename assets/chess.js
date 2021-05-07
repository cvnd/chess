var socket = io();
var turn = 'light';
var start = false;
$(function() {

  $('.game').hide();
  $('input#game-url').attr('value', window.location.href);
  const room = window.location.pathname.substring(1, window.location.pathname.length).split('/')[1];
  
  socket.emit('join', {room: room, side: side});

  //console.log(side);

  socket.on('start game', function() {
    //console.log(room);

    window.onbeforeunload = function () {
      clearSelections();
      return 'Are you sure you want to leave? You will forfeit the game';
    }

    //console.log(side);
  
    $('#lobby').hide();
    $('.game').show();

    updateTurn(side);
    if(start == false) {
      boardInit();
      piecesInit(side);
      start = true;
    }

    if(side !== 'observer'){
      $('.tile').click(function() {
        if(turn !== side) {
          //console.log(turn);
          return;
        }
        // console.log("CLIQUE");
        //console.log($(this).hasClass('selected'));
    
        // Deselecting piece
        if($(this).hasClass('selected')) {
          clearSelections();
          return;
        }
        //Show moves on a tile
        if($(this).hasClass('occupied') && $($(this).children('i')[0]).hasClass(side)) {
          $(".tile.empty").html('');

          clearSelections();
          if($(this).hasClass('selected')) {
            $(this).removeClass('selected');
          } else {
            $(".tile.empty").html('');
            $(this).addClass('selected');
            //console.log('calcuplating');
            var options = calculateMovesByElements($(this).children('i')[0], side);
            //console.log(options);
            boardIndicators(options);
          }
          return;  
        }

        var piece = $('.tile.selected i')[0];
        if($(this).hasClass('avail') || $(this).hasClass('capture')) {

          // Side to go next
          var nextTurn = 'light';
          if(side === 'light') {
            nextTurn = 'dark';
          }

          var data = {
            side: side,
            room: room,
            piece: $(piece).attr('title').toLowerCase(),
            origin: $(piece).parent().attr('data-position'),
            target: $(this).attr('data-position'),
            turn: nextTurn
          }
          socket.emit('move', data);
        }

      });
    }

  });

  socket.on('piece moved', function(data) {
    turn = data.turn;
    //console.log(data);
    var yOrigin = data.origin[0];
    var xOrigin = data.origin[1];

    var yTarget = data.target[0];
    var xTarget = data.target[1];

    if(data.side !== side) {
      yOrigin = 9 - yOrigin;
      xOrigin = 9 - xOrigin;

      yTarget = 9 - yTarget;
      xTarget = 9 - xTarget;
    }

    var origin = $('.tile[data-position="' + yOrigin + '' + xOrigin + '"]')[0];
    var target = $('.tile[data-position="' + yTarget + '' + xTarget + '"]')[0];

    //console.log(origin);
    //console.log(target);
    var piece = $(origin).children('i')[0];
    //console.log(piece);
    updateTurn(side);

    if(data.side !== side) {
      opponentMove(piece, target);
      return;
    } else {
      move(piece, target);
      check(room);
    }
    clearSelections();
  });


  // socket.on('disconnect', function() {
  //   if(start) {
  //   let data = {
  //       room: room,
  //       side: side
  //     }
  //     console.log("client forefeit...");
  //     socket.emit('forfeiting', data);
  //   }
  // });

  socket.on('forfeiting', function(forfeitingSide) {
    if(start) {
      var header ='';
      var body = ''
      if(side !== 'observer') {
        header = 'You win!';
        body = 'The opponent has forfeited and left the game.';
      } else {
        if(forfeitingSide === 'dark') {
          header = 'White wins!';
          body = 'Black has forfeited and left the game.'
        } else {
          header = 'Black wins!';
          body = 'White has forfeited and left the game.';
        }
      }
      const structure = '<i class="fas fa-chess"></i>' +
                        '<div id="modal-header">' + header + '</div>'+
                        '<div id="modal-body">' + body + '</div>'+
                        '<div id="modal-footer"><button id="modal-exit">Return to Home</button></div>';
      var modal = document.createElement('div');
      $(modal).attr('id', 'popup');
      $(modal).html(structure);

      var block = document.createElement('div');
      $(block).attr('id', 'popup-cover');
      $('body').append(modal);
      $('body').append(block);

      $('button#modal-exit').click(function(){
        window.location.href = '/';
      });
    }
  });
  // socket.on('game over', function(data) {
  //   console.log("game over??");
  //   if(data.winner === side) {
  //     alert("You won!");
  //   }
  // });

  socket.on('checked', function(data) {
    console.log("check data: " + data);
    if(data === side) {
      var king = $('#board .inner .tile i[title="King"]')[0];
      console.log("ze king: ");
      console.log(king);
      $(king).parent().addClass('check');
    }
  })
});

function clearSelections() {
  $(".tile.selected").removeClass('selected');
  $('.tile.avail').removeClass('avail').html('');
  $(".tile.capture").removeClass('capture');
  $(".tile.check").removeClass('check');
}

function updateTurn(side) {
  console.log(side + " " + turn);
  if(side !== 'observer') {
    if(turn === side) {
      $('#turn').html('Your turn');
    } else {
      $('#turn').html("Opponent's turn");
    }
  } else {
    if(turn === 'light') {
      $('#turn').html("White's turn");
    } else {
      $('#turn').html("Black's turn");

    }
  }
}

function boardInit() {
  for(let i = 1; i < 9; i++) {
    var row = document.createElement( "div" );
    $(row).attr('class', 'row');
    for(let j = 1; j < 9; j++) {
      var tile = document.createElement("div");
      var tileClass = 'light';
      if((i % 2 === 0 && j % 2 === 0) || (i % 2 === 1 && j % 2 === 1)) {
        tileClass = 'dark';
      } 
      $(tile).attr({
        'class': 'tile empty ' + tileClass,
        'data-position': '' + i + j +''
      });
      $(row).append(tile);
    }
    $("#board .inner").append(row);
  }

  var rows = $('#board .inner').children();
  for(let i = 0; i < 8; i++) {
    $(rows[i]).css("grid-row-start", 9 - 1 - i);
  }
}

function piecesInit(side) {
  //Rooks
  var rows = $('#board .inner .row');
  //console.log(rows[0]);

  var specialRows = [rows[0], rows[7]];
  var pawnRows = [rows[1], rows[6]];
  for(let i = 0; i < 2; i++) {
    if(i == 1) {
      if(side == 'dark') {
        side = 'light';
      } else {
        side = 'dark';
      }
    }
    let pawnTiles = $(pawnRows[i]).children();
    $(pawnTiles).append('<i class="fas fa-chess-pawn piece '+ side +'" title="Pawn"></i>').addClass('occupied').removeClass('empty');

    let tiles = $(specialRows[i]).children();
    $(tiles).addClass('occupied').removeClass('empty');
    if(i == 0) {
      //side = 'light';
      $(tiles[3]).append('<i class="fas fa-chess-queen piece '+ side +'" title="Queen"></i>');
      $(tiles[4]).append('<i class="fas fa-chess-king piece '+ side +'" title="King"></i>');  
    } else {
      $(tiles[4]).append('<i class="fas fa-chess-queen piece '+ side +'" title="Queen"></i>');
      $(tiles[3]).append('<i class="fas fa-chess-king piece '+ side +'" title="King"></i>');  

    }

    $(tiles[0]).append('<i class="fas fa-chess-rook piece '+ side +'" title="Rook"></i>');
    $(tiles[7]).append('<i class="fas fa-chess-rook piece '+ side +'" title="Rook"></i>');

    $(tiles[1]).append('<i class="fas fa-chess-knight piece '+ side +'" title="Knight"></i>');
    $(tiles[6]).append('<i class="fas fa-chess-knight piece '+ side +'" title="Knight"></i>');

    $(tiles[2]).append('<i class="fas fa-chess-bishop piece '+ side +'" title="Bishop"></i>');
    $(tiles[5]).append('<i class="fas fa-chess-bishop piece '+ side +'" title="Bishop"></i>');


  }
}

function opponentMove(piece, target) {
  $('.tile.target').removeClass('target');
  $('.tile.origin').removeClass('origin');

  var origin = $(piece).parent();
  var capturePiece = $(target).children('i')[0];

  if(typeof capturePiece !== 'undefined') {
    $('#opponent-captures').append(capturePiece);
  }

  $(origin).html('');
  $(origin).addClass('origin empty').removeClass('occupied');
  //$(target).html('');
  $(target).append(piece).addClass('target occupied').removeClass("empty");

  return;
}

function move(piece, target) {
  //console.log("playermove");
  $('.tile.target').removeClass('target');
  $('.tile.origin').removeClass('origin');
  //console.log(target);
  //console.log(piece);
  //console.log($(piece).parent().hasClass('selected'));
  if($(piece).parent().hasClass('selected')) {
    //console.log('has calsss');
    var origin = $(piece).parent();
    $(origin).addClass('origin');
    // console.log(origin);
    // console.log(piece);
    // console.log("origin: " + origin);
    $(origin).html('');
    $('.tile.avail').removeClass('avail').html('');
    $('.tile.selected').removeClass('selected');
    $(origin).removeClass('occupied').addClass('empty');

    if($(target).hasClass('capture')) {
      var capturePiece = $(target).children('i')[0];
      var capturedCount = $('#player-captures').children().length;
      //console.log(capturedCount / 2);
      //console.log(Math.floor(capturedCount / 2));
      $('#player-captures').append(capturePiece);      
      $(capturePiece).css('grid-row-start', 8 - Math.floor(capturedCount / 4));
      $(target).removeClass('capture');
    } else {
      $(target).removeClass('empty').addClass('occupied');
    }
    $(target).append(piece).addClass('target');
  }

  
  // var opponent = 'light';
  // if(side === 'light') {
  //   opponent = 'dark';
  // }
}

// See if any move will kill the king
function check(room) {
  console.log("Checking...");
  const pieces = $('#board .inner').find('i.' + side);

  var check = false;
  outer:
  for(let i = 0; i < pieces.length; i++) {
    console.log(pieces[i]);
    var piecesInDanger = calculateMovesByElements(pieces[i], side).capture;
    console.log("Pieces in danger: ");
    console.log(piecesInDanger);
    if(piecesInDanger.length > 1) {
      for(let j = 1; j < piecesInDanger.length; j++) {
        // console.log(j);
        // console.log(piecesInDanger[i]);
        var currentPiece = $(piecesInDanger[j]).children('i')[0];
        console.log(currentPiece);
        if($(currentPiece).attr('title') === 'King') {
          check = true;
          break outer;
        }
      }
    }
    
    // if(typeof piecesInDanger === undefined) {
    //   break;
    // }

  }

  // console.log("Check? " + check);
  // if(check) {
  //   alert("Check!");
  // }

  if(check) {
    console.log("CHECK");
    var checked = 'light';
    if(side === 'light') {
      checked = 'dark'
    }

    socket.emit('check', {room: room, side: checked});
  }

}

function calculateMovesByElements(piece, side) {
  //console.log(piece);
// Both piece and location are elements
  var moves = {
    capture: [''],
    avails: ['']
  };
  const indicator = '<i class="fas fa-times"></i>';
  var allRows = $("#board .row");
  var type = $(piece).attr('title').toLowerCase();
  var pos = $(piece).parent().attr('data-position');
  const originTile = $(piece).parent();
  const originRow = $(originTile).parent();
  const row = pos[0] - 1;
  const col = pos[1] - 1;
  //console.log(row);
  //console.log(col);

  if(type === 'pawn') {
    // console.log("pawnee");
    let newRow = allRows[row + 1];
    let extraRow = allRows[row + 2];
    //console.log(newRow);
    let newTile = $(newRow).children()[col];
    let extraTile = $(extraRow).children()[col];

    let captureTiles = [$(newRow).children()[col - 1], $(newRow).children()[col + 1]];

    if($(newTile).hasClass("empty")) {
      //$(newTile).addClass('avail');
      //$(newTile).append(indicator);
      moves.avails.push(newTile);
      if(row === 1 && $(extraTile).hasClass("empty")) {
        //$(extraTile).append(indicator);
        //$(extraTile).addClass('avail');
        moves.avails.push(extraTile);

      }
      // console.log("pawns");
      // console.log(moves.avails);
      // console.log(moves);

    }

    for(let i = 0; i < 2; i++) {
      let tile = captureTiles[i];
      let targetPiece = $(tile).children('i')[0];
      if($(tile).hasClass('occupied') && !$(targetPiece).hasClass(side)) {
        //$(tile).addClass('capture');
        console.log("CAN CAPTURE");
        moves.capture.push(tile);
      }
    }

    return moves;
  }

  if(type ==='rook' || type === 'queen') {
    // Cardinal directions
    for(let i = 0; i < 4; i++) {
      let x = 1;
      let y = 0;
      if(i == 1) {
        x = 0;
        y = 1;
      }

      if(i == 2) {
        x = -1;
      }

      if(i == 3) {
        y = -1;
        x = 0;
      }
      for(let j = 1; j < 9; j++) {
        var newRow = row + j*y;
        var newCol = col + j*x;
        let tile = $(allRows[newRow]).children()[newCol];
        if($(tile).hasClass('empty')) {
          //$(tile).addClass('avail').append(indicator);
          moves.avails.push(tile);
        } else {
          // If tile is occupied with a piece NOT on your side
          let targetPiece = $(tile).children('i')[0];
          //console.log(targetPiece);
          if($(tile).hasClass('occupied') && !$(targetPiece).hasClass(side)) {
            //$(tile).addClass('capture');
            moves.capture.push(tile);
          }
          break;
        }
      }
    }
  }

  if(type === 'knight') {
    let Ecol = col + 1;
    let Nrow = row + 1;
    let Srow = row - 1;
    let Wcol = col - 1;
    let EEcol = col + 2;
    let WWcol = col -2;
    let NNrow = row + 2;
    let SSrow = row - 2;
    
    let tiles = [];
    // let NNEtile = $(allRows[NNrow]).children()[Ecol];
    // let NEEtile = $(allRows[Nrow]).children()[EEcol];
    // let NNWtile = $(allRows[NNrow]).children()[Wcol];
    // let NWWtile = $(allRows[Nrow]).children()[WWcol];
    // let SSE = $(allRows[SSrow]).children()[Ecol];
    // let SSW = $(allRows[SSrow]).children()[Wcol];
    // let SEE = $(allRows[Srow]).children()[EEcol];
    // let SWW = $(allRows[Srow]).children()[WWcol];

    tiles.push($(allRows[NNrow]).children()[Ecol]);
    tiles.push($(allRows[Nrow]).children()[EEcol]);
    tiles.push($(allRows[NNrow]).children()[Wcol]);
    tiles.push($(allRows[Nrow]).children()[WWcol]);
    tiles.push($(allRows[SSrow]).children()[Ecol]);
    tiles.push($(allRows[SSrow]).children()[Wcol]);
    tiles.push($(allRows[Srow]).children()[EEcol]);
    tiles.push($(allRows[Srow]).children()[WWcol]);

    //console.log(tiles);
    for(let i = 0; i < tiles.length; i++) {
      let tile = tiles[i];
      if($(tile).hasClass('empty')) {
        //$(tile).addClass('avail').append(indicator);
        moves.avails.push(tile);
      } else {
        let targetPiece = $(tile).children('i')[0];
        if($(tile).hasClass('occupied') && !$(targetPiece).hasClass(side)) {
          //$(tile).addClass('capture');
          moves.capture.push(tile);
        }
      }
    }
    return moves;
  }

  if(type === 'bishop' || type === 'queen') {
    let x = 1;
    let y = 1;
    for(let i = 0; i < 4; i++) {

      if(i == 1) {
        x = -1;
        y = 1;
      }

      if(i == 2) {
        x = -1;
        y = -1;  
      }

      if(i == 3) {
        x = 1;
        y = -1;  
      }

      for(let j = 1; j < 8; j++) {
        var xPos = col + (x * j);
        var yPos = row + (y * j);
        if((xPos > 7 || xPos < 0) || (yPos > 7 || yPos < 0)) {
          break;
        }

        let tile = $(allRows[yPos]).children()[xPos];
        if($(tile).hasClass('empty')) {
          //$(tile).addClass('avail').append(indicator);
          moves.avails.push(tile);
        } else {

          let targetPiece = $(tile).children('i')[0];
          if($(tile).hasClass('occupied') && !$(targetPiece).hasClass(side)) {
            //$(tile).addClass('capture');
            moves.capture.push(tile);
          }

          break;
        }
      }
    }
  }

  //TO-DO: king

  if(type === 'king') {
    for(let i = -1; i < 2; i++) {
      let currentRow = allRows[row + i];
      for(let j = -1; j < 2; j++) {
        let tile = $(currentRow).children()[col + j];
        if($(tile).hasClass('empty')) {
          //$(tile).addClass('avail').append(indicator);
          moves.avails.push(tile);

        } else {
          let targetPiece = $(tile).children('i')[0];
          if($(tile).hasClass('occupied') && !$(targetPiece).hasClass(side)) {
            //$(tile).addClass('capture');
            moves.capture.push(tile);
          }
        }
      }
    }
    return moves;
  }
  //console.log(moves);
  return moves;
}

function boardIndicators(tiles) {
  //console.log(tiles);
  const avails = tiles.avails;
  const captures = tiles.capture;
  const indicator = '<i class="fas fa-times"></i>';

  for(let i = 1; i <= avails.length + 1; i++) {
    $(avails[i]).addClass('avail').append(indicator);
  }

  for(let i = 1; i <= captures.length + 1; i++) {
    $(captures[i]).addClass('capture');
  }
}