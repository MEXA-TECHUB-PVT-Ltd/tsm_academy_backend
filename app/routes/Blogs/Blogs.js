
const express = require('express');
const router = express.Router();
const controller = require("../../controllers/Blogs/blogs")

router.post("/createBlog" , controller.createBlog);
router.post("/updateBlog" , controller.updateBlog);
router.post("/deleteBlog" , controller.deleteBlog);
router.post("/deleteAllBlog" , controller.deleteAllBlog);
router.get("/getAllBlogs" , controller.getAllBlogs);
router.get("/getAllBlogsActive" , controller.getAllBlogsActive);

router.post("/getBlogDetails" , controller.getBlogDetails);

module.exports = router;