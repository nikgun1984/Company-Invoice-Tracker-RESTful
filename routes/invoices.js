const db = require('../db');
const express = require('express');
const ExpressError = require('../expressError');

const invoicesRouter = new express.Router();

invoicesRouter.get('/', async (req, res, next) => {
  try {
    const invoices = await db.query(`SELECT * FROM invoices`);
    return res.json(invoices.rows);
  } catch (err) {
    next(err);
  }
});

invoicesRouter.get('/:id', async (req, res, next) => {
  try {
    const result = await db.query(`SELECT * FROM invoices WHERE id=$1`, [
      req.params.id,
    ]);
    if (result.rows.length === 0) {
      throw new ExpressError(
        `Cannot find any invoice with id ${req.params.id}`,
        404
      );
    }
    return res.status(200).json(result.rows[0]);
  } catch (err) {
    return next(err);
  }
});

invoicesRouter.post('/', async (req, res, next) => {
  try {
    const { comp_code, amt, paid, add_date, paid_date } = req.body;
    const invoice = await db.query(
      `INSERT INTO invoices (comp_code,amt,paid,add_date,paid_date) VALUES($1,$2,$3,$4,$5) RETURNING comp_code,amt,paid,add_date,paid_date`,
      [comp_code, amt, paid, add_date, paid_date]
    );
    return res.status(201).json(invoice.rows[0]);
  } catch (err) {
    return next(err);
  }
});

invoicesRouter.put('/:id', async (req, res, next) => {
  try {
    const { comp_code, amt, paid, add_date, paid_date } = req.body;
    const invoice = await db.query(
      `UPDATE invoices SET comp_code=$1, amt=$2, paid=$3, add_date=$4, paid_date=$5 WHERE id = $6 RETURNING id,comp_code,amt,paid,add_date,paid_date`,
      [comp_code, amt, paid, add_date, paid_date, req.params.id]
    );
    if (invoice.rows.length === 0) {
      throw new ExpressError(
        `Cannot update invoice with id ${req.params.id}`,
        404
      );
    }
    return res.status(200).json(invoice.rows[0]);
  } catch (err) {
    return next(err);
  }
});

invoicesRouter.delete('/:id', async (req, res, next) => {
  try {
    const invoice = db.query(`DELETE FROM invoices WHERE id=$1`, [
      req.params.id,
    ]);
    if (invoice.rows) {
      throw new ExpressError(
        `Cannot find invoice with id ${req.params.id}`,
        404
      );
    }
    return res.status(200).json({ message: 'DELETED...' });
  } catch (err) {
    return next(err);
  }
});

module.exports = invoicesRouter;
