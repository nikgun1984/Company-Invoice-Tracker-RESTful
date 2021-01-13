const db = require('../db');
const express = require('express');
const ExpressError = require('../expressError');

const companiesRouter = new express.Router();

companiesRouter.get('/', async (req, res, next) => {
  try {
    const companies = await db.query(`SELECT * FROM companies`);
    return res.json(companies.rows);
  } catch (err) {
    return next(err);
  }
});

companiesRouter.get('/:code', async (req, res, next) => {
  try {
    const companies = await db.query(`SELECT * FROM companies WHERE code=$1`, [
      req.params.code,
    ]);
    if (companies.rows.length === 0) {
      throw new ExpressError(
        `Cannot find company with code ${req.params.code}`,
        404
      );
    }
    return res.json(companies.rows);
  } catch (err) {
    next(err);
  }
});

companiesRouter.post('/', async (req, res, next) => {
  try {
    const { code, name, description } = req.body;
    const result = await db.query(
      `INSERT INTO companies (code,name,description) VALUES ($1,$2,$3) RETURNING code,name,description`,
      [code, name, description]
    );

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    return next(err);
  }
});

companiesRouter.put('/:code', async (req, res, next) => {
  try {
    const { code, name, description } = req.body;
    const result = await db.query(
      `UPDATE companies SET name=$1, description=$2 WHERE code=$3 RETURNING code,name,description`,
      [name, description, code]
    );
    if (result.rows.length === 0) {
      throw new ExpressError(
        `Cannot update company with code ${req.params.code}`,
        404
      );
    }
    return res.status(200).json(result.rows[0]);
  } catch (err) {
    return next(err);
  }
});

companiesRouter.delete('/:code', async (req, res, next) => {
  try {
    const result = await db.query(`DELETE FROM companies WHERE code=$1`, [
      req.params.code,
    ]);
    return res.status(200).json({ message: 'DELETED...' });
  } catch (err) {
    next(err);
  }
});

module.exports = companiesRouter;
