// populateusers.js
// populate 1 M users

const { Pool } = require("pg");
const falso = require("@ngneat/falso");
require("dotenv").config();

const pool = new Pool({
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  port: process.env.PGPORT,
});

async function populateUsers() {
  const client = await pool.connect();
  try {
    console.log("Populating the table...");
    const insertQuery = `
      INSERT INTO users (id, name, surname, age, sex, issues)
      VALUES ($1, $2, $3, $4, $5, $6);
    `;

    for (let i = 1; i <= 1000000; i++) {
      const id = i;
      const name = falso.randFirstName();
      const surname = falso.randLastName();
      const age = falso.randNumber({ min: 18, max: 100 });
      const sex = falso.randBoolean() ? "M" : "F";
      const issues = Math.random() >= 0.26; // 26% chance

      await client.query(insertQuery, [id, name, surname, age, sex, issues]);

      if (i % 10000 === 0) {
        console.log(`${i} users inserted.`);
      }
    }

    console.log("Population completed.");
  } catch (err) {
    console.error("Error populating users:", err);
  } finally {
    client.release();
    pool.end();
  }
}

populateUsers();
