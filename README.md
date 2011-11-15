Steve - JSON's best friend
===

A JSON CORS/XHR2 application platform.

**Application platform** means a web service that can be used to build integral applications. For example, Facebook offers an application platform.

The goal being that Applications could register an API key which would grant them access to their users' data
as well as services such as sending emails and content hosting.

The platform aggregates the data and makes it useful, but the client-side implementation is left to a third-party to implement.

Progress
===

  * CORS/XHR2 session module - working
    * Uses headers or route (or cookies or json body) to maintain session
  * Sends JSON by default.
  * Uses `Node.JS`, `Connect`, and `Express` under the hood

CORS Sessions
---

Normally a session would be maintained by Cookies. If it is known that users will only be using web-browsers, that would be ideal.
However, in the case of Internet Explorer, MSIE will probably never support CORS' `withCredentials` or `Access-Control-Allow-Credentials`.

In that case, it is simple enough to define a header (`X-User-Session` by default), that will store the user's session.
For the few cases that this isn't practical, setting the session in the URL as a query parameter (`userSession` by default) will work.

For convenience, the end-developer may prefer to send the session in a JSON POST body (`userSession` by default).
