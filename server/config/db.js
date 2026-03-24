const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "carbon-footprint",
  password: process.env.DB_PASSWORD,
  port: 5433,
});

module.exports = pool;