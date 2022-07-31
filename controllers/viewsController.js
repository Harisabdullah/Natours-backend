const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getOverview = catchAsync( async (req, res, next) => {
  // 1) Get the tour data from the database
  const tours = await Tour.find();

  // 2) Build the template
  // 3) Render the output using tour data from step 1
  res.status(200).render('overview', {
    title: 'All Tours',
    tours: tours
  });
});

exports.getAccount = catchAsync( async (req, res, next) => {
  res.status(200).render('account', {
    title: 'Your account'
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  // 1) Get the data, for the requested tour (including reviews and guides)
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user'
  });

  if(!tour){
    return next(new AppError('There is no tour with that name.', 404));
  }

  // 2) Build the template
  // 3) Render the output using the tour data from step 1
  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour: tour
  })
})

exports.getLoginForm = async (req, res) => {
  res.status(200).render('login', {
    title: 'Log into your account'
  });
}

exports.updateUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(req.user.id, {
    name: req.body.name,
    email: req.body.email
  },
    {
      new: true,
      runValidators: true
    });

  res.status(200).render('account', {
    title: 'Your account',
    user: updatedUser
  });
})