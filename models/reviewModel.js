// review
// rating
// created at
// reference to tour
// reference to user

const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema({
  review: {
    type: String,
    required: [true, 'Please provide a review'],
    minlength: [10, 'Review must be at least 10 characters'],
    maxlength: [200, 'Review must be at most 200 characters'],
    trim: true,
  },
  rating: {
    type: Number,
    required: [true, 'Please provide a rating'],
    min: [1, 'Rating must be above or equal to 1.0'],
    max: [5, 'Rating must be below or equal to 5.0'],
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'Review must belong to a tour'],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Review must belong to a user'],
  }
},
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre( /^find/, function(next){
  // this.populate({
  //   path: 'tour',
  //   select: 'name'
  // });
  this.populate({
    path: 'user',
    select: 'name photo'
  });
  next();
});

reviewSchema.statics.calcAverageRatings = async function(tourId){
  const stats = await this.aggregate([
    {
      $match: { tour: tourId }
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);

  if(stats.length > 0){
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5
    });
  }
}

reviewSchema.post('save', function(){
  // "this" points to the current review being saved
  this.constructor.calcAverageRatings(this.tour);
});

reviewSchema.pre(/^findOneAnd/, async function(next){
  this.r = await this.findOne();
  console.log(this.r);
  next();
})

reviewSchema.post(/^findOneAnd/, async function(){
  await this.r.constructor.calcAverageRatings(this.r.tour);
})



const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;