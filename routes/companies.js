const express = require("express");
const ExpressError = require("../expressError");

const companiesRouter = new express.Router();
const db = require("../db");

companiesRouter.get("/", async (req, res, next) => {
	debugger;
	try {
		const companies = await db.query(`SELECT * FROM companies`);
		return res.json(companies.rows);
	} catch (err) {
		return next(err);
	}
});

module.exports = companiesRouter;
