(function () {
  "use strict";

  var regExp = /(.*\/\/)www\.(.*)/i;

  function nowww(req, res, next) {
    var match
      , url;

    if (!(match = regExp.exec(req.url))) {
      return next();
    }

    url = match[1] + match[2];
    hostname = match[2];
    res.statusCode = 302;
    res.setHeader('Location', url);
    // TODO set token to notify browser to notify user about www
    res.write(
        'Quit with the www already!!! It\'s not 1990 anymore!'
      + '<br/>'
      + '<a href="' + url + '">' + hostname + '</a>'
      + '<br/>NOT www.' + hostname
      + '<br/>NOT http://' + hostname
      + '<br/>just <a href="http://' + hostname + '">' + hostname + '</a> !!!'
      + '<br/>'
      + ';-P'
    );
    res.end();
  }

  function create() {
    return nowww;
  }

  module.exports = create;
}());
