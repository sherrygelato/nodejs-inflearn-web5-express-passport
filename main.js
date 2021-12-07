var express = require('express');
var app = express();
var fs = require('fs');
var bodyParser = require('body-parser');
var compression = require('compression');
var helmet = require('helmet')
app.use(helmet());

var session = require('express-session')
var FileStore = require('session-file-store')(session);

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(compression());

var authData = {
  email: 'test@example.com',
  password: '1234321!',
  nickname: 'sherrygelato'
}

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  store: new FileStore()
}))

// passport는 session을 참고해서 사용하기 때문에
// 꼭꼭!! 세션 다음에 코드 작성
var passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy(
  // params가 username과 password로 되어있는데
  // 이미 설정되어있는 email과 pwd로 바꿈
  {
    usernameField: 'email',
    passwordField: 'pwd'
  },
  function (username, password, done) {
    console.log('LocalStrategy', username, password)

    if (username === authData.email) {
      console.log(1)
      if (password === authData.password) {
        console.log(2)
        return done(null, authData);
      } else {
        console.log(3)
        return done(null, false, {
          message: 'Incorrect password.'
        });
      }
    } else {
      console.log(4)
      return done(null, false, {
        message: 'Incorrect username.'
      });
    }

  /*
  // 상위 done이라는 함수가 어떻게 되는가에 따른 로그인 처리
  User.findOne({ username: username }, function (err, user) {
  
    // 에러 발생 시 에러를 첫번째 인자로 주고 passport가 알아서 처리
    if (err) { return done(err); }

    // user가 없다면, 왜 실패 했는지 
    if (!user) {
      return done(null, false, { message: 'Incorrect username.' });
    }

    // 사용자가 있으나 password 틀림
    if (!user.validPassword(password)) {
      return done(null, false, { message: 'Incorrect password.' });
    }

    // 사용자에 대한 정보 
    return done(null, user);
  });
  */
}
));

// /login으로 로그인 정보를 보냈을 때
app.post('/auth/login_process',
  // callback 함수가 passport 
  passport.authenticate('local', {
    // local: id, pwd 로그인 방식
    successRedirect: '/',
    failureRedirect: '/auth/login'
  }));
  


app.get('*', function(request, response, next){
  fs.readdir('./data', function(error, filelist){
    request.list = filelist;
    next();
  });
});

var indexRouter = require('./routes/index');
var topicRouter = require('./routes/topic');
var authRouter = require('./routes/auth');

app.use('/', indexRouter);
app.use('/topic', topicRouter);
app.use('/auth', authRouter);

app.use(function(req, res, next) {
  res.status(404).send('Sorry cant find that!');
});

app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).send('Something broke!')
});

app.listen(3000, function() {
  console.log('Example app listening on port 3000!')
});
