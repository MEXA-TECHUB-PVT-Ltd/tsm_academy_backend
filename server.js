const express = require("express");
const app = express();

const PORT = 5000;
const bodyParser = require("body-parser");
require("dotenv").config();
const cors = require("cors");

app.use(
  cors({
    methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH"],
  })
);

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());

app.use(
  cors({
    methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH"],
  })
);

app.use("/uploads", express.static("uploads"));

app.use("/upload-image", require("./app/upload-image"));

app.use("/user", require("./app/routes/Users/customerRoute"));
app.get("/", (req, res) => {
  res.status(200).json({ error: false, message: "Server is running" });
});
// company
app.use("/contact_us", require("./app/routes/ContactUs/ContactUs"));
app.use("/program", require("./app/routes/Programs/Programs"));
app.use("/package", require("./app/routes/Package/PackageRoute"));
app.use("/program_videos", require("./app/routes/ProgramVideos/ProgramVideos"));
app.use("/review", require("./app/routes/Review/Review"));
app.use("/blogs", require("./app/routes/Blogs/Blogs"));

// const server =
app.listen(PORT, () => {
  console.log(`
################################################
       Server listening on port: ${PORT}
################################################
`);
});
