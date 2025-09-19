const mysql = require("mysql2/promise");

const db = mysql.createPool({
  host: "localhost",
  user: "root",          // change if needed
  password: "admin", // change if needed
  database: "datax"
});

module.exports = db;
