nowww
===

Redirects any domain with `www` to the same site without it.

  * `www.foobar3000.com` -> `foobar3000.com`
  * `www.helloworld3000.com` -> `helloworld3000.com`

See [no-www.org][no-www.org] ![no-www.org][no-www.ico]

  [no-www.ico]: http://no-www.org/images/blog-button.gif
  [no-www.org]: http://no-www.org

In short:

  All domains should have a `www` for backwards compatibility with what
early adopters of the internet have come to expect (and ctrl+enter adds it).
However, those domains should redirect to the root of the domain.

  * it means we type four fewer charaters
  * we don't type `http://` anymore, why would we type `www.`?
  * it's what the cool kids do (i.e. github)
  * `ftp`, `irc`, `ssh`, etc all have their own *protocols*. Why should the web also have a prefix?

Installation
===

    npm install nowww

Usage
===

    (function () {
      "use strict";

      var connect = require('connect')
        , nowww = require('nowww')
        , server
        ;

      server = connect.createServer(
          nowww()
        , connect.favicon()
        , connect.static(__dirname + '/')
      );

      server.listen(3000);
      console.log('Listening on ', 3000);
    }());
