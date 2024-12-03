// Stories service
// Epxress.js framework
// Postgresql

const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();
const port = 3001;

// PostgreSQL pool
const pool = new Pool();

// Middleware
app.use(bodyParser.json());

// API Stories Version v1
const prefix = "/v1";

internalError = "Internal server error";

// Create a product
app.post(`${prefix}/stories`, async (req, res) => {
  const { store_id, PLU, date, action_id } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO stories (store_id, "PLU", date, action_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [store_id, PLU, date, action_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: internalError });
  }
});

app.get(`${prefix}/stories`, async (req, res) => {
  const {
    store_id,
    PLU,
    start_date,
    end_date,
    action_id,
    page = 1,
    limit = 10,
  } = req.query;

  // Calculate offset for pagination
  const offset = (page - 1) * limit;

  try {
    const result = await pool.query(
      `
        SELECT id, store_id, "PLU", date::TEXT AS date, action_id
        FROM stories
        WHERE ($1::int IS NULL OR store_id = $1)
          AND ($2::text IS NULL OR "PLU" = $2)
          AND ($3::date IS NULL OR date >= $3)
          AND ($4::date IS NULL OR date <= $4)
          AND ($5::int IS NULL OR action_id = $5)
        ORDER BY date DESC, id DESC
        LIMIT $6 OFFSET $7;
        `,
      [
        store_id,
        PLU,
        start_date,
        end_date,
        action_id,
        parseInt(limit),
        parseInt(offset),
      ]
    );

    res.json({
      page: parseInt(page),
      limit: parseInt(limit),
      total: result.rows.length,
      data: result.rows,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: internalError });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Stories service is running at http://localhost:${port}`);
});
