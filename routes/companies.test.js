process.env.NODE_ENV = "test";

const request = require("supertest");

const app = require("../app");
const db = require("../db");

let testCompany;

beforeEach(async function () {
	let result = await db.query(
		`INSERT INTO companies (code,name,description) VALUES ('windows','microsoft office','word,excel,access')`
	);
	testCompany = result.rows[0];
});

afterEach(async () => {
	await db.query("DELETE FROM companies");
});

afterAll(async () => {
	//close db connection
	await db.end();
});

describe("GET /companies", function () {
	test("Gets a list of companies", async function () {
		const response = await request(app).get(`/companies`);
		expect(response.statusCode).toEqual(200);
		expect(response.body).toEqual([testCompany]);
	});
});

describe("GET /companies/:code", function () {
	test("Gets a company", async function () {
		const response = await request(app).get(`/companies/${testCompany.code}`);
		expect(response.statusCode).toEqual(200);
		expect(response.body).toEqual([testCompany]);
	});
});

describe("POST /companies", function () {
	test("Create a company", async function () {
		const response = await request(app).post(`/companies`).send({
			code: "apple",
			name: "iPad Air",
			description: "Liquid Retina Display with A14 Bionic",
		});
		expect(response.statusCode).toEqual(201);
		expect(response.body).toEqual({
			code: "apple",
			name: "iPad Air",
			description: "Liquid Retina Display with A14 Bionic",
		});
	});
});

describe("PATCH /companies/:code", function () {
	test("Update company's fields", async function () {
		const response = await request(app)
			.patch(`/companies/${testCompany.code}`)
			.send({
				code: "windows",
				name: "Windows 11",
				description: "Concept 2021",
			});
		expect(response.statusCode).toEqual(200);
		expect(response.body).toEqual({
			code: "windows",
			name: "Windows 11",
			description: "Concept 2021",
		});
	});
	test("Responds with 404 code Not Found", async function () {
		const response = await request(app).patch(`/companies/0`);
		expect(response.statusCode).toEqual(404);
	});
});

describe("DELETE /companies/:code", function () {
	test("Delete company", async function () {
		const response = await request(app).delete(
			`/companies/${testCompany.code}`
		);
		expect(response.statusCode).toEqual(200);
		expect(response.body).toEqual({ message: "DELETED..." });
	});
});
