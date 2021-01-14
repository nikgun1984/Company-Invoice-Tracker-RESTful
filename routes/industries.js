const db = require('../db');
const express = require('express');
const slugify = require('slugify');
const ExpressError = require('../expressError');

const industriesRouter = new express.Router();

industriesRouter.post('/', async (req, res, next) => {
  try {
    const { industry } = req.body;
    const code = slugify(industry, { lower: true });

    const result = await db.query(
      `INSERT INTO industries (code,industry) VALUES ($1,$2) RETURNING code,industry`,
      [code, industry]
    );

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    return next(err);
  }
});

industriesRouter.get('/:code', async (req, res, next) => {
  try {
    const industries = await db.query(`
        SELECT i.code, i.industry,c.code FROM industries AS i
        LEFT JOIN industries_has_companies AS ic
        ON i.code = ic.industry_code
        LEFT JOIN companies AS c ON c.code = ic.comp_code
    `);
    return res.json(industries.rows);
  } catch (err) {
    return next(err);
  }
});

industriesRouter.post('/:code', async (req, res, next) => {
  try {
    const { comp_code } = req.body;

    const result = await db.query(
      `INSERT INTO industries_has_companies (comp_code,industry_code) VALUES ($1,$2) RETURNING comp_code,industry_code`,
      [comp_code, req.params.code]
    );
    return res.json(result.rows);
  } catch (err) {
    return next(err);
  }
});

module.exports = industriesRouter;
