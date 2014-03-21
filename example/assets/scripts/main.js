(function ($) {
  
  function submitHandler ($form, e) {
    var btn = $form.find('button')
      , url = $form.attr('action')
      , data = $form.serializeArray()
      , infoBox = $('#shopinfo pre');
    
    e.preventDefault();
    btn.button('loading');
    
    $.post(url, data, function (data, response) {
      console.log(data, response);
      
      if (data.redirect) {
        window.location = data.url
      }
      else {
        infoBox.text(JSON.stringify(data));
        btn.button('reset');
      }
    });
  };

  $('#config-oauth').submit(function (e) {
    var $form = $(this);
    submitHandler($form, e);
  });

  $('#config-basic').submit(function (e) {
    var $form = $(this);
    submitHandler($form, e);
  });
})(jQuery)