const db = require("../db");
const express = require("express");
const ExpressError = require("../expressError");

const invoicesRouter = new express.Router();

invoicesRouter.get("/", async (req, res, next) => {
	try {
		const invoices = await db.query(`SELECT * FROM invoices`);
		return res.json(invoices.rows);
	} catch (err) {
		next(err);
	}
});

invoicesRouter.get("/:id", async (req, res, next) => {
	try {
		const result = await db.query(`SELECT * FROM invoices WHERE id=$1`, [
			req.params.id,
		]);
		return res.status(200).json(result.rows[0]);
	} catch (err) {
		return next(err);
	}
});

invoicesRouter.post("/", async (req, res, next) => {
	try {
		const addDate = new Date().toISOString();
		const { comp_code, amt, paid } = req.body;

		const invoice = await db.query(
			`INSERT INTO invoices (comp_code,amt,paid,add_date,paid_date) VALUES($1,$2,$3,$4,$5) RETURNING comp_code,amt,paid,add_date,paid_date`,
			[comp_code, amt, paid, addDate, addDate]
		);
		return res.status(201).json(invoice.rows[0]);
	} catch (err) {
		return next(err);
	}
});

invoicesRouter.patch("/:id", async (req, res, next) => {
	try {
		const { comp_code, amt, paid, add_date, paid_date } = req.body;
		console.log(req.body);
		const invoice = await db.query(
			`UPDATE invoices SET comp_code=$1, amt=$2, paid=$3, add_date=$4, paid_date=$5 WHERE id = $6 RETURNING id,comp_code,amt,paid,add_date,paid_date`,
			[comp_code, amt, paid, add_date, paid_date, req.params.id]
		);
		return res.status(200).json(invoice.rows[0]);
	} catch (err) {
		return next(err);
	}
});

invoicesRouter.delete("/:id", async (req, res, next) => {
	try {
		const invoice = db.query(`DELETE FROM invoices WHERE id=$1`, [
			req.params.id,
		]);
		return res.json({ message: "DELETED" });
	} catch (err) {
		return next(err);
	}
});

module.exports = invoicesRouter;
