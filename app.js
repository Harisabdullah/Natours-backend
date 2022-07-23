const express = require('express');
const morgan = require('morgan');
const fs = require('fs');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController')
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');


const app = express();
// Big fix for trailing spaces in node.env variables
process.env.Node_ENV = process.env.Node_ENV.trim();


// GLOBAL Middlewares

// Development Logging
if (process.env.NODE_ENV ==='development'){
  app.use(morgan('dev'));
}
// Production Logging
if (process.env.NODE_ENV ==='production'){
  app.use(morgan('dev'));

  // Write to Access log

  // app.use(morgan('combined', {
  //   stream: fs.createWriteStream('./logs/access.log', {flags: 'a'})
  // }));
}

// set Security HTTP headers
app.use(helmet());

// Limit requests from same IP
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000, // milliseconds
  message: 'Too many requests from this IP, please try again in hour!'
});
app.use('/api',limiter);


// Body parser, reading data from the body into req.body
app.use(express.json({ limit: '10kb' }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS (cross site scripting attacks)
app.use(xss());

// Prevent HTTP Parameter Pollution
app.use(hpp({
  whitelist: [
    'duration',
    'ratingsQuantity',
    'ratingsAverage',
    'maxGroupSize',
    'difficulty',
    'price']
}));

// Serving static files
app.use(express.static(`${__dirname}/public`))

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log(req.requestTime);
  next();
})


// Routes
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req,res,next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`), 404);
})

app.use(globalErrorHandler);

module.exports = app;

