// Marketplace service
// Epxress.js framework
// Postgresql

const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
require("dotenv").config();
const logAction = require("./requests");

const app = express();
const port = 3000;

// PostgreSQL pool
const pool = new Pool();

// Middleware
app.use(bodyParser.json());

// API Version v1
const prefix = "/v1";

const internalError = "Internal server error";

//region !PRODUCTS

// Create a product
app.post(`${prefix}/products`, async (req, res) => {
  const { name, PLU } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO products (name, "PLU") VALUES ($1, $2) RETURNING *',
      [name, PLU]
    );

    await logAction({
      store_id: null,
      PLU: PLU, // Add PLU to the story
      date: new Date().toISOString(),
      action_id: 1, // "A product has been created"
    });

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: internalError });
  }
});

//  Get products by filter (name, PLU)
app.get(`${prefix}/products`, async (req, res) => {
  const { name, PLU } = req.query;
  try {
    const result = await pool.query(
      `SELECT * FROM products WHERE ($1::text IS NULL OR name = $1) AND ($2::text IS NULL OR "PLU" = $2)`,
      [name, PLU]
    );

    await logAction({
      store_id: null,
      PLU: PLU, // Add PLU to the story
      date: new Date().toISOString(),
      action_id: 2, // Action id 2 "Products table has been accessed"
    });

    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: internalError });
  }
});

//endregion

//region !STOCK

// Create stock
app.post(`${prefix}/stock`, async (req, res) => {
  const { product_id, store_id, quantity_all, quantity_reserved } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO stock (product_id, store_id, quantity_all, quantity_reserved) VALUES ($1, $2, $3, $4) RETURNING *",
      [product_id, store_id, quantity_all, quantity_reserved]
    );
    const PLU = await pool.query(`SELECT "PLU" FROM products WHERE id = $1`, [
      product_id,
    ]);

    await logAction({
      store_id,
      PLU: PLU.rows[0].PLU,
      date: new Date().toISOString(),
      action_id: 3, // "Stock record has been created"
    });

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: internalError });
  }
});

// Increase stock
app.put(`${prefix}/stock/increase/:id`, async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;
  try {
    const result = await pool.query(
      "UPDATE stock SET quantity_all = quantity_all + $1 WHERE id = $2 RETURNING *",
      [quantity, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).send("Stock not found");
    }
    const product_id = await pool.query(
      `SELECT "product_id" FROM stock WHERE id = $1`,
      [id]
    );
    const PLU = await pool.query(`SELECT "PLU" FROM products WHERE id = $1`, [
      product_id.rows[0].product_id,
    ]);
    const store_id = await pool.query(
      `SELECT "store_id" FROM stock WHERE id = $1`,
      [id]
    );

    // Log action to stories server
    await logAction({
      store_id: store_id.rows[0].store_id,
      PLU: PLU.rows[0].PLU,
      date: new Date().toISOString(),
      action_id: 4, // "A stock record has been increased"
    });

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: internalError });
  }
});

// Decrease stock
app.put(`${prefix}/stock/decrease/:id`, async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;
  try {
    const result = await pool.query(
      "UPDATE stock SET quantity_all = quantity_all - $1 WHERE id = $2 RETURNING *",
      [quantity, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).send("Stock not found");
    }
    const product_id = await pool.query(
      `SELECT "product_id" FROM stock WHERE id = $1`,
      [id]
    );
    const PLU = await pool.query(`SELECT "PLU" FROM products WHERE id = $1`, [
      product_id.rows[0].product_id,
    ]);
    const store_id = await pool.query(
      `SELECT "store_id" FROM stock WHERE id = $1`,
      [id]
    );

    await logAction({
      store_id: store_id.rows[0].store_id,
      PLU: PLU.rows[0].PLU,
      date: new Date().toISOString(),
      action_id: 5, // "A stock record has been decreased"
    });

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: internalError });
  }
});

// Get stock by filters (PLU, store_id, quantity_all, quantity_reserved)
app.get(`${prefix}/stock`, async (req, res) => {
  const { PLU, store_id, quantity_all, quantity_reserved } = req.query;
  try {
    const result = await pool.query(
      `SELECT s.*, p."PLU", st.name AS store_name 
             FROM stock s 
             JOIN products p ON s.product_id = p.id 
             JOIN stores st ON s.store_id = st.id 
             WHERE ($1::text IS NULL OR p."PLU" = $1) 
             AND ($2::integer IS NULL OR s.store_id = $2)
             AND ($3::integer IS NULL OR s.quantity_all = $3)
             AND ($4::integer IS NULL OR s.quantity_reserved = $4)`,
      [PLU, store_id, quantity_all, quantity_reserved]
    );

    await logAction({
      store_id: null,
      PLU: null,
      date: new Date().toISOString(),
      action_id: 6, // "Stock table has been accessed"
    });

    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: internalError });
  }
});

//endregion

// Start the server
app.listen(port, () => {
  console.log(`Stock service is running at http://localhost:${port}`);
});
