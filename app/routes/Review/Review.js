const express = require("express");
const router = express.Router();
const controller = require("../../controllers/Review/review");

router.post("/createReview", controller.createReview);
router.post("/updateReview", controller.updateReview);
router.post("/deleteReview", controller.deleteReview);
router.post("/deleteAllReview", controller.deleteAllReview);
router.get("/getAllReviews", controller.getAllReviews);
router.post("/getReviewDetails", controller.getReviewDetails);
router.post("/getWebsiteContentByName", controller.getWebsiteContentByName);
router.get("/getAllWebsiteContent", controller.getAllWebsiteContent);
router.post(
  "/createOrUpdateWebsiteContent",
  controller.createOrUpdateWebsiteContent
);
router.post("/createFAQ", controller.createOrUpdateFaq);
router.get("/getAllFaqs", controller.getAllFaqs);
router.post("/deleteFaq", controller.deleteFaq);
module.exports = router;
