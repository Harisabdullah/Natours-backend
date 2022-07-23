const express = require('express');

const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const router = express.Router({mergeParams: true});

// POST /tour/2234/reviews
// GET /tour/2234/reviews
// POST /reviews

router.use(authController.protect);

router.route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.restrictTo('user'),
    reviewController.setTourUserIds,
    reviewController.createReview
  );

router.route('/:id')
  .get(reviewController.getReview)
  .delete(authController.restrictTo('user', 'admin'),reviewController.deleteReview)
  .patch(authController.restrictTo('user', 'admin'), reviewController.updateReview)

module.exports = router;