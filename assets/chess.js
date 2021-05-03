$(function() {
  $('#board').hide();
  $('input#game-url').attr('value', window.location.href);
  const room = window.location.pathname.substring(1, window.location.pathname.length).split('/')[1];;
  var socket = io();
  socket.emit('join', room);

  console.log(side);

  socket.on('start game', function() {

    // window.onbeforeunload = function () {
    //   return 'Are you sure you want to leave? You will forfeit the game';
    // }
  
    $('#lobby').hide();
    $('#board').show();
    boardInit();
    piecesInit(side);

    $('.tile').click(function() {
      console.log("CLIQUE");
      //console.log($(this).hasClass('selected'));
  
      if($(this).hasClass('selected')) {
          $(this).removeClass('selected');
          $('.tile.avail').removeClass('avail').html('');
          return;
      }
      //Show moves
      if($(this).hasClass('occupied') && $($(this).children()[0]).hasClass(side)) {
        $(".tile.empty").html('');
  
        // Purge classes
        $(".tile.selected").removeClass('selected');
        $('.tile.avail').removeClass('avail').html('');
        if($(this).hasClass('selected')) {
          $(this).removeClass('selected');
        } else {
          $(".tile.empty").html('');
          $(this).addClass('selected');
  
          calculateMovesByElements($(this).children()[0]);
        }
        return;  
      }
      //Go move
      var piece = $('.tile.selected i')[0];
      if($(this).hasClass('avail')) {
        move(piece, this);
      }
    });
  
  });
  //console.log(side);
  console.log("CHESS BABY???");

  // boardInit();
  // piecesInit();

  // $('.tile.occupied').click(function() {
  //   console.log('clicky');
  //   $(".tile.empty").html('');

  //   // Purge classes
  //   $(".tile.selected").removeClass('selected');
  //   $('.tile.avail').removeClass('avail');
  //   if($(this).hasClass('selected')) {
  //     $(this).removeClass('selected');
  //   } else {
  //     $(".tile.empty").html('');
  //     $(this).addClass('selected');

  //     calculateMovesByElements($(this).children()[0]);
  //   }

  //   //$('.tile.occupied').unbind('click');
  // });

});

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
    if(side == 'dark') {
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

function move(piece, target) {

  $('.tile.target').removeClass('target');
  $('.tile.origin').removeClass('origin');
  //console.log(target);
  //console.log(piece);
  if($(piece).parent().hasClass('selected')) {
    var origin = $(piece).parent();
    $(origin).addClass('origin');
    console.log(origin);
    console.log(piece);
    // console.log("origin: " + origin);
    $(origin).html('');
    $('.tile.avail').removeClass('avail').html('');
    $('.tile.selected').removeClass('selected');
    $(origin).removeClass('occupied').addClass('empty');
    $(target).append(piece).addClass('occupied target').removeClass('empty');

  }
}

function calculateMovesByElements(piece) {
// Both piece and location are elements
  const indicator = '<i class="fas fa-times"></i>';
  var allRows = $("#board .row");
  var type = $(piece).attr('title').toLowerCase();
  var pos = $(piece).parent().attr('data-position');
  const originTile = $(piece).parent();
  const originRow = $(originTile).parent();
  const row = pos[0] - 1;
  const col = pos[1] - 1;
  console.log(row);
  console.log(col);

  if(type === 'pawn') {
    // console.log("pawnee");
    let newRow = allRows[row + 1];
    let extraRow = allRows[row + 2];
    //console.log(newRow);
    let newTile = $(newRow).children()[col];
    let extraTile = $(extraRow).children()[col];
    if($(newTile).hasClass("empty")) {
      $(newTile).addClass('avail');
      $(newTile).append(indicator);
      if(row === 1 && $(extraTile).hasClass("empty")) {
        $(extraTile).append(indicator);
        $(extraTile).addClass('avail');
  
      }
    }


    return;
  }

  if(type ==='rook' || type === 'queen') {
    // Cardinal directions
    for(let i = 0; i < 4; i++) {
      var x = 1;
      var y = 0;
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
        let tiles = $(allRows[newRow]).children();
        if($(tiles[newCol]).hasClass('empty')) {
          $(tiles[newCol]).addClass('avail').append(indicator);
        } else {
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

    for(let i = 0; i < tiles.length; i++) {
      if($(tiles[i]).hasClass('empty')) {
        $(tiles[i]).addClass('avail').append(indicator);
      }
    }
  }

  if(type === 'bishop' || type === 'queen') {

    for(let i = 0; i < 4; i++) {
      if(i == 0) {
        var x = 1;
        var y = 1;  
      }

      if(i == 1) {
        var x = -1;
        var y = 1;
      }

      if(i == 2) {
        var x = -1;
        var y = -1;  
      }

      if(i == 3) {
        var x = 1;
        var y = -1;  
      }

      for(let j = 1; j < 8; j++) {
        var xPos = col + (x * j);
        var yPos = row + (y * j);
        if((xPos > 7 || xPos < 0) || (yPos > 7 || yPos < 0)) {
          break;
        }

        var tile = $(allRows[yPos]).children()[xPos];
        if($(tile).hasClass('empty')) {
          $(tile).addClass('avail').append(indicator);
        } else {
          break;
        }
      }
    }
  }

  //TO-DO: king
}