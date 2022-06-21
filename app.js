const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const hbs=require('express-handlebars')
const jwt=require('jsonwebtoken')
const Mongoose = require('mongoose')
const session=require('express-session')
const bodyParser=require('body-parser')
const swal = require('sweetalert')
const adminRouter = require('./routes/admin');
const userRouter = require('./routes/user');
const app = express();

//mongoose connection
Mongoose.connect('mongodb://localhost:27017/ecommerce',{useNewUrlParser:true})
Mongoose.connection.on("error",err=>{
  console.log(err);
})
Mongoose.connection.on("connected",(err,res)=>{
  console.log("mongoose is connected");
})



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs',hbs.engine({extname:'hbs',defaultLayout:'layout',layoutsDir:__dirname+'/views/layout/',partialsDir:__dirname+'/views/partials'}))
app.use(bodyParser.urlencoded({ extended: false }))

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({secret:"key",resave:false,saveUninitialized:true,cookie:{maxAge:6000000}}))
app.use('/admin', adminRouter);
app.use('/', userRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
