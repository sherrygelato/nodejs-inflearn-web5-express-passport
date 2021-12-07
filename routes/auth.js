var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');
var sanitizeHtml = require('sanitize-html');
var template = require('../lib/template.js');

module.exports = function (passport) {
  router.get('/login', function (request, response) {
    var fmsg = request.flash()
    var feedback = ''
    if (fmsg.error) {
      feedback = fmsg.error[0]
    }
    console.log(fmsg)
    var title = 'WEB - login';
    var list = template.list(request.list);
    var html = template.HTML(title, list, `
    <div style="color:red;">${feedback}</div>
    <form action="/auth/login_process" method="post">
      <p><input type="text" name="email" placeholder="email"></p>
      <p><input type="password" name="pwd" placeholder="password"></p>
      <p>
        <input type="submit" value="login">
      </p>
    </form>
    `, '');
    response.send(html);
  });

  // /login으로 로그인 정보를 보냈을 때
  router.post('/login_process',
    // callback 함수가 passport
    passport.authenticate('local', {
      // local: id, pwd 로그인 방식
      successRedirect: '/',
      failureRedirect: '/auth/login',
      failureMessage: true,
      successFlash: true
    })
  );
  
  // destroy : 세션이 삭제됨
  router.get('/logout', function (request, response) {

    // passport logout
    request.logout();

    // session delete
    // request.session.destroy(function (err) {
    //   response.redirect('/');
    // });

    request.session.save(function () {
      response.redirect('/');
    });
  })

  return router;
};