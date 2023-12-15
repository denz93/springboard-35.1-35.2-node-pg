/** Server startup for BizTime. */


const app = require("./app");
const { init_db } = require("./db");
init_db();

app.listen(3000, function () {
  console.log("Listening on 3000");
});