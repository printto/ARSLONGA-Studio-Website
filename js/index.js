$(document).ready(function() {

  $("#promo-box").animate({ opacity: 1 }, "slow");

  $(document).on('click', function() {
    $("#promo-box").fadeOut();
  });

});
