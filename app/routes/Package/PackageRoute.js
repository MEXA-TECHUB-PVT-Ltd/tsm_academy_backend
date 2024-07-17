const express = require("express");
const router = express.Router();
const controller = require("../../controllers/PACKAGE/packageController");

router.post("/add", controller.createPackage);
router.get("/getAllPackages", controller.getAllPackages);
router.get("/getAllActivePackages", controller.getAllActivePackages);
router.post("/getUserOtherCourses", controller.getuserOtherCourses);

router.post("/getUserEnrolledCourses", controller.getUserEnrolledCourses);

// createHomepageVideo
router.post("/createHomepageVideo", controller.createHomepageVideo);
router.get("/getHomepageVideoUrl", controller.getHomepageVideoUrl);
router.post("/createHomepageVideo1", controller.createHomepageVideo1);
router.get("/getHomepageVideoUrl1", controller.getHomepageVideoUrl1);
router.post("/createHomepageVideo2", controller.createHomepageVideo2);
router.get("/getHomepageVideoUrl2", controller.getHomepageVideoUrl2);

router.post("/update", controller.updatePackage);
router.post("/updatePackageStatus", controller.updatePackageStatus);
// router.post("/updatePackage" , controller.updatePackage);
router.post("/deletePackage", controller.deletePackage);
router.post("/deleteAllPackage", controller.deleteAllPackage);
router.post("/getByProgramId", controller.getPackageByProductId);
router.post("/getPackageByPriceId", controller.getPackageByPriceId);

router.get("/getAllVideos", controller.getAllVideos);
router.post("/getByVideoId", controller.getByVideoId);
router.post("/addProgressUser", controller.addProgressUser);
router.post("/getVideoProgress", controller.getVideoProgress);
router.post("/calculateProgressUser", controller.calculateProgressUser);

module.exports = router;
