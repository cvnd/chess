$(function() {

    var socket = io();

    var messages = document.getElementById('messages');
    var form = document.getElementById('form');
    var input = document.getElementById('input');
  
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      if (input.value) {
        socket.emit('chat message', input.value);
        input.value = '';
      }
    });
  
    socket.on('chat message', function(msg) {
      var item = document.createElement('li');
      item.textContent = msg;
      messages.appendChild(item);
      window.scrollTo(0, document.body.scrollHeight);
    });
  
  
    console.log("CHESS BABY???");

    boardInit();
    piecesInit();

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

    $('.tile').click(function() {
      //console.log($(this).hasClass('selected'));

      if($(this).hasClass('selected')) {
          $(this).removeClass('selected');
          $('.tile.avail').removeClass('avail').html('');
          return;
      }
      //Show moves
      if($(this).hasClass('occupied') && $($(this).children()[0]).hasClass('light')) {
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

function boardInit() {
  for(let i = 1; i < 9; i++) {
    var row = document.createElement( "div" );
    $(row).attr('class', 'row');
    for(let j = 1; j < 9; j++) {
      var tile = document.createElement("div");
      var tileClass = 'dark';
      if((i % 2 === 0 && j % 2 === 0) || (i % 2 === 1 && j % 2 === 1)) {
        tileClass = 'light';
      } 
      $(tile).attr({
        'class': 'tile empty ' + tileClass,
        'data-position': '' + (9 - i) + j +''
      });
      $(row).append(tile);
    }
    $("#board .inner").append(row);
  }
}

function piecesInit() {
  //Rooks
  var rows = $('#board .inner .row');
  //console.log(rows[0]);

  var specialRows = [rows[0], rows[7]];
  for(let i = 0; i < 2; i++) {
    let side = 'dark';
    let tiles = $(specialRows[i]).children();
    $(tiles).addClass('occupied').removeClass('empty');
    if(i != 0) {
      side = 'light';
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

  var pawnRows = [rows[1], rows[6]];
  for(let i = 0; i < 2; i++) {
    let side = 'dark';
    if(i != 0) {
      side = 'light';
    }
    let tiles = $(pawnRows[i]).children();

    $(tiles).append('<i class="fas fa-chess-pawn piece '+ side +'" title="Pawn"></i>').addClass('occupied').removeClass('empty');



  }
}

function move(piece, target) {
  //console.log(target);
  //console.log(piece);
  if($(piece).parent().hasClass('selected')) {
    var origin = $(piece).parent();
    console.log(origin);
    console.log(piece);
    // console.log("origin: " + origin);
    $(origin).html('');
    $('.tile.avail').removeClass('avail').html('');
    $('.tile.selected').removeClass('selected');
    $(origin).removeClass('occupied').addClass('empty');
    $(target).append(piece).addClass('occupied').removeClass('empty');

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
  const row = 8 - pos[0];
  const col = pos[1] - 1;
  console.log(row);
  console.log(col);

  if(type === 'pawn') {
    // console.log("pawnee");
    let newRow = allRows[row - 1];
    let extraRow = allRows[row - 2];
    //console.log(newRow);
    let newTile = $(newRow).children()[col];
    let extraTile = $(extraRow).children()[col];
    if($(newTile).hasClass("empty")) {
      $(newTile).addClass('avail');
      $(newTile).append(indicator);
    }

    if(row === 6 && $(extraTile).hasClass("empty")) {
      $(extraTile).append(indicator);
      $(extraTile).addClass('avail');

    }
    return;
  }

  if(type ==='rook') {
    var rowMaxOffset = 0;
    var rowMinOffset = 0;
    var colMinOffset = 0;
    var colMaxOffset = 0;
    var rowMaxCollision = false;
    var rowMinCollision = false;
    var colMaxCollision = false;
    var colMinCollision = false;

    while(!rowMaxCollision) {
      let displacement = row - rowMaxOffset - 1;
      console.log(displacement);
      if(displacement < 0) {
        break;
      }
      let newRow = allRows[displacement];
      let target = $(newRow).children()[col];
      console.log(target);
      if($(target).hasClass('empty')) {
        rowMaxOffset++;
        console.log("rowMaxOffset: " + rowMaxOffset);
      } else {
        rowMaxCollision = true;
      }
    }

    while(!rowMinCollision) {
      let displacement = row + rowMinOffset + 1;
      if(displacement > 7) {
        break;
      }

      let newRow = allRows[displacement];
      let target = $(newRow).children()[col];
      if($(target).hasClass('empty')) {
        rowMinOffset++;
      } else {
        rowMinCollision = true;
      }
    }

    while(!colMaxCollision) {
      let displacement = col + colMaxOffset + 1;
      if(displacement > 7) {
        break;
      }

      let target = $(allRows[row]).children()[displacement];
      if($(target).hasClass('empty')) {
        colMaxOffset++;
      } else {
        colMaxCollision = true;
      }
    }

    while(!colMinCollision) {
      let displacement = col - colMinOffset - 1;
      if(displacement < 0) {
        break;
      }

      let target = $(allRows[row]).children()[displacement];
      if($(target).hasClass('empty')) {
        colMinOffset++;
      } else {
        colMinCollision = true;
      }
    }

    console.log(colMinOffset + " " + colMaxOffset + " " + rowMaxOffset + " " + rowMinOffset);
    for(let i = 0; i < colMinOffset; i++) {
      let currentRow = $(allRows[row]);
      $($(currentRow).children()[col - i - 1]).addClass('avail').append(indicator);
    }

    for(let i = 0; i < colMaxOffset; i++) {
      let currentRow = $(allRows[row]);
      $($(currentRow).children()[col + i + 1]).addClass('avail').append(indicator);
    }

    for(let i = 0; i < rowMinOffset; i++) {
      let currentRow = $(allRows[row + i + 1]);
      $($(currentRow).children()[col]).addClass('avail').append(indicator);
    }

    for(let i = 0; i < rowMaxOffset; i++) {
      let currentRow = $(allRows[row - i - 1]);
      $($(currentRow).children()[col]).addClass('avail').append(indicator);
    }

  }

  if(type === 'knight') {
    let Ecol = col + 1;
    let Nrow = row - 2;
    let Srow = row + 2;
    let Wcol = col - 1;
    let EEcol = col + 2;
    let WWcol = col -2;
    let NNrow = row - 2;
    let SSrow = row + 2;
    
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
    let SWW = ($(allRows[Srow]).children()[WWcol]);
  }

}