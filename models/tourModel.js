  const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name'],
    unique: true,
    trim:true,
    maxlength:[40, 'A tour name must have less or equal then 40 characters'],
    minlength:[10, 'A tour name must have more or equal then 10 characters']
    // validate: [validator.isAlpha, 'Tour name must only contain characters']
  },
  slug: String,
  duration: {
    type: Number,
    required: [true, 'A tour must have a duration']
  },
  maxGroupSize: {
    type: Number,
    required: [true, 'A tour must have a group size']
  },
  difficulty:{
    type: String,
    required: [true, 'A tour must have a difficulty'],
    enum: { // Only for Strings
      values: ['easy', 'medium', 'difficult'],
      message: 'Difficulty is either easy, medium, difficult'
    }
  },
  rating: {
    type: Number,
    default: 4.5,
    min:[1, 'Rating must be above or equal to 1.0'],
    max:[5, 'Rating must be below or equal to 5.0']
  },
  ratingsAverage: {
    type: Number,
    default: 4.5,
    // Also works with dates as well as numbers
    min:[1, 'Ratings Average must be above or equal to 1.0'],
    max:[5, 'Ratings Average must be below or equal to 5.0']
  },
  ratingsQuantity: {
    type: Number,
    default: 0
  },
  price: {
    type: Number,
    required: [true, 'A tour must have a price']
  },
  priceDiscount:{
    type: Number,
    validate:{
      validator: function(val){
        // Does not work for UPDATE because the "this"
        // keyword points to current NEWLY created document
        return val < this.price;
      },
      message: 'Discount price ({VALUE}) should be below regular price.'
    }
  },
  summary:{
    type: String,
    trim:true,
    required: [true, 'A tour must have a summary']
  },
  description: {
    type: String,
    trim: true,
  },
  imageCover: {
    type: String,
    required: [true, 'A tour must have a cover image']
  },
  images: [String],
  createdAt:{
    type: Date,
    default: Date.now(),
    select: false
  },
  startDates: [Date],
  secretTour: {
    type: Boolean,
    default: false
  },
  startLocation: {
    // GeoJSON
    type:{
      type: String,
      default: 'Point',
      enum: {
        values: ['Point'],
        message: ['Coordinate can only be a point']
      }
    },
    coordinates : [Number],
    address: String,
    description: String
  },
  locations: [
    {
      type: {
        type: String,
        default: 'Point',
        enum: {
          values: ['Point'],
          message: ['Coordinate can only be a point']
        }
      },
      coordinates: [Number],
      address: String,
      description: String,
      day: Number
    }
  ]
},
{
  toJSON: { virtuals: true},
   toObject: {virtuals: true}
  }
);

tourSchema.virtual('durationWeeks')
  .get(function(){
    return this.duration / 7;
  });

// DOCUMENT MIDDLEWARE: run before .save() command and the .create() commands
tourSchema.pre('save', function(next){
  this.slug = slugify(this.name, {lower: true});
  next();
})

// For reference
// tourSchema.pre('save', function(next){
//   console.log("Will save document!!");
//   next();
// })
//
// tourSchema.post('save', function(doc, next){
//   console.log(doc);
//   next();
// })



// QUERY MIDDLEWARE
// tourSchema.pre('find', function(next){
tourSchema.pre(/^find/g, function(next){
  this.find({secretTour: { $ne: true }})
  this.start = Date.now();
  next();
});

tourSchema.post(/^find/, function(docs, next){
  console.log(`Query took ${Date.now() - this.start} milliseconds!`);
  next();
})


// AGGREGATION MIDDLEWARE
tourSchema.pre('aggregate', function(next){
  this.pipeline().unshift({
    $match: { secretTour: {$ne: true}}
  })
  next();
})





const Tour = mongoose.model('Tour', tourSchema);
module.exports =  Tour;
