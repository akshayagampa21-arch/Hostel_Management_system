const express = require("express");
const app = express();

app.use(express.static("public"));

// Redirect root to login page
app.get("/", (req, res) => {
  res.redirect("/login.html");
});

app.listen(3000, () => {
  console.log("RK Hostel running at http://localhost:3000");
});
