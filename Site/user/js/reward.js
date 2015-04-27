
function countUp(count)
{
  var div_by = 1,
      speed = 1,
      $display = $('.count'),
      run_count = 1,
      int_speed = 1;
  
  /*var int = setInterval(function() {
    if(run_count < div_by){
      $display.text(count);
      run_count++;
    } else if(parseInt($display.text()) < count) {
      var curr_count = parseInt($display.text()) + 1;
      $display.text(curr_count);
    } else {
      clearInterval(int);
    }
  }, int_speed); */ 

  var int = $display.text(count);
}
