const express = require("express");
const app = express();
require("./dal/user_business");
const user = require("./routes/user");
const business = require("./routes/business");

app.use(express.json());
app.use("/user", user);
app.use("/business", business);

app.listen(3000, () => {
  console.log("listening at http://localhost:3000");
});
