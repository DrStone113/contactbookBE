const { DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME } = process.env;

const types = require("pg").types;
types.setTypeParser(types.builtins.INT8, (value) => {
  return parseInt(value, 10);
});

module.exports = require("knex")({
  client: "pg",
  connection: {
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASS,
    database: DB_NAME,
  },
  pool: { min: 0, max: 10 },
});
