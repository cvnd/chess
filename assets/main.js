$(function() {
    // var socket = io();
    //console.log(socket);
    var messages = document.getElementById('messages');
    var form = document.getElementById('form');
    var input = document.getElementById('input');
  
    // form.addEventListener('submit', function(e) {
    //   e.preventDefault();
    //   if (input.value) {
    //     socket.emit('chat message', input.value);
    //     input.value = '';
    //   }
    // });
  
    // socket.on('chat message', function(msg) {
    //   var item = document.createElement('li');
    //   item.textContent = msg;
    //   messages.appendChild(item);
    //   window.scrollTo(0, document.body.scrollHeight);
    // });

    $('button#generateRoom').click(function(){

      var url = Math.random().toString(36).slice(2, 11);
      console.log(url);
      //console.log(socket.id);
      window.location.href = '/play/' + url;
      // $.ajax({
      //   url: '/play/' + url,
      //   success: function(data) {
      //     console.log("WEE");
      //   }
      // });
    });

    // $('#generateRoom').click(function() {
    //     socket.join('some room');
    //     console.log("connected to room");
    // });
});