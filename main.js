var express = require('express');
var app = express();
var fs = require('fs');
var bodyParser = require('body-parser');
var compression = require('compression');
var helmet = require('helmet')
app.use(helmet());

var session = require('express-session')
var FileStore = require('session-file-store')(session);
var flash = require('connect-flash')

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(compression());

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  store: new FileStore()
}))
app.use(flash())

// 1회용 메세지다 
app.get('/flash', function(req, res){
  // Set a flash message by passing the key, followed by the value, to req.flash().
  req.flash('msg', 'Flash is back!!')
  res.send('flash')
});

app.get('/flash-display', function(req, res){
  // Get an array of flash messages by passing the key to req.flash()
  var fmsg = req.flash()
  console.log(fmsg)
  res.send(fmsg)
});

var authData = {
  email: 'test@example.com',
  password: '1234321!',
  nickname: 'sherrygelato'
}

// passport는 session을 참고해서 사용하기 때문에
// 꼭꼭!! 세션 다음에 코드 작성
var passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy;

app.use(passport.initialize());
app.use(passport.session())

// sesion 처리 
// passport.use(LocalStrategy)에서 
// 성공 시 authData를 user인자로 넘긴다 
passport.serializeUser(function (user, done) {
  console.log('serializeUser', user)
  done(null, user.email); // 식별자만 저장 
});

passport.deserializeUser(function (id, done) {
  console.log('deserializeUser', id)
  done(null, authData);
  // User.findById(id, function(err, user) {
  //   done(err, user);
  // });
});

// 로그인 시도 시 사용자 유무 
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
  }
));

// /login으로 로그인 정보를 보냈을 때
app.post('/auth/login_process',
  // callback 함수가 passport 
  passport.authenticate('local', {
    // local: id, pwd 로그인 방식
    successRedirect: '/',
    failureRedirect: '/auth/login',
    failureMessage: true,
    successFlash: true
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
