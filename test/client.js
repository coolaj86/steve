(function () {
  "use strict";

  $.ajax({
      url: "http://localhost:5080/four-oh-four"
    , success: function (data) {
        console.log('Success', data);
      }
    , error: function (err) {
        console.log('Error', err);
      }
    , complete: function (xhr) {
        consolel.log('Complete', xhr);
      }
    , headers: {
          "X-User-Session": "badSession"
      }
  });

}());
