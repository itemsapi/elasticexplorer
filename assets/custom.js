
$.ajaxSetup({
  beforeSend:function() {
    $('.ajax-loader').show();
  },
  complete:function() {
    $('.ajax-loader').hide();
  }
});

