const db = require('../db');
const express = require('express');
const slugify = require('slugify');
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
    const companies = await db.query(
      `
		SELECT c.code, c.name, c.description,i.industry FROM companies AS c
		LEFT JOIN industries_has_companies AS ic
		ON c.code = ic.comp_code
		LEFT JOIN industries AS i ON i.code = ic.industry_code
		WHERE c.code = $1`,
      [req.params.code]
    );
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
    const { name, description } = req.body;
    const code = slugify(name, { lower: true });

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
    const { name, description } = req.body;
    const new_name = slugify(name, { lowercase: true });
    const result = await db.query(
      `UPDATE companies SET code=$1,name=$2, description=$3 WHERE code=$4 RETURNING code,name,description
	  `,
      [new_name, name, description, req.params.code]
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
