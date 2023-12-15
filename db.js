/** Database setup for BizTime. */
const pg = require("pg");
const errors = require('./db-errors');

const db = new pg.Client({
  host: 'localhost',
  database: 'biztime',
})



async function init_db() {
  db.connect((err) => {
    console.log(`Connect to database`)
  })
}


module.exports = {
  db,
  init_db,
  errors
}