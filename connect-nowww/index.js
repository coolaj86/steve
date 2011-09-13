(function () {
  "use strict";

  //var regExp = /(.*\/\/)www\.(.*)/i;

  function nowww(req, res, next) {
    var match
      , host = req.headers.host.replace(/^www\./, '')
      , hostname = host.split(':')[0]
      , href = 'http://' + host + req.url
      , url
      ;

    if (host === req.headers.host) {
      return next();
    }

    /*
    if (!(match = regExp.exec(req.url))) {
      return next();
    }
    */

    //url = match[1] + match[2];
    //hostname = match[2];
    res.statusCode = 302;
    // TODO how to determine http vs https?
    res.setHeader('Location', href);
    // TODO set token to notify browser to notify user about www
    res.write(
        'Quit with the www already!!! It\'s not 1990 anymore!'
      + '<br/>'
      + '<a href="' + href + '">' + hostname + '</a>'
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
