$(function() {

    $('button#generateRoom').click(function(){
      // Generate random url string
      var url = Math.random().toString(36).slice(2, 11);
      window.location.href = '/play/' + url;

    });


});