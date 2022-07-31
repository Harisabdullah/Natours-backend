const path = require('path');
const express = require('express');
const morgan = require('morgan');
const compression = require('compression');

const fs = require('fs');
// const cors = require('cors');
// const proxy = require('http-proxy-middleware');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController')
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewRoutes');

const app = express();


app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));


// Big fix for trailing spaces in node.env variables
process.env.Node_ENV = process.env.Node_ENV.trim();


// GLOBAL Middlewares

// Serving static files
app.use(express.static(path.join(__dirname, 'public')))

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
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'", 'https://js.stripe.com'],
    scriptSrc: ["'self'", 'https://api.mapbox.com/mapbox.js/v3.3.1/mapbox.js' ,'https://js.stripe.com', 'https://checkout.stripe.com'],
    styleSrc: ["'self'", 'https://*.googleapis.com'],
    imgSrc: ["'self'", 'data:', 'https://*.stripe.com'],
    fontSrc: ["'self'", 'https://fonts.gstatic.com'],
    connectSrc: ["'self'", 'https://api.mapbox.com' ,'https://events.mapbox.com' ,'https://api.stripe.com', 'https://checkout.stripe.com'],
    frameAncestors: ["'none'"],
    frameSrc: ["'self'", 'https://js.stripe.com', 'https://hooks.stripe.com', 'https://checkout.stripe.com'],
    childSrc: ["'self'"],
    baseUri: ["'self'"],
    formAction: ["'self'"],
    RequireSriFor: ["script", "style"],
  },
  reportOnly: true
}));
// app.use(function (req, res, next) {
//   // allow stripe csp to work
//   res.setHeader('Content-Security-Policy', "connect-src https://api.stripe.com; frame-src https://js.stripe.com https://hooks.stripe.com; script-src 'self' https://js.stripe.com/v3/ https://js.stripe.com https://checkout.stripe.com");
//
//   next();
// });

// Limit requests from same IP
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000, // milliseconds
  message: 'Too many requests from this IP, please try again in hour!'
});
app.use('/api',limiter);


// Body parser, reading data from the body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

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

app.use(compression());
// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
})


// Routes
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req,res,next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`), 404);
})

app.use(globalErrorHandler);

module.exports = app;

