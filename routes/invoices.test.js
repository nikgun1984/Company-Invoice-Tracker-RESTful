process.env.NODE_ENV = 'test';

const request = require('supertest');

const app = require('../app');
const db = require('../db');

let testInvoice;

beforeEach(async function () {
  await db.query(
    `INSERT INTO companies (code,name,description) VALUES ('windows','microsoft office','word,excel,access')`
  );
  let result = await db.query(
    `INSERT INTO invoices (comp_code,amt,paid,add_date,paid_date) VALUES ('windows',1000,true,'2021-02-02T05:00:00.000Z','2021-02-02T05:00:00.000Z') RETURNING id,comp_code,amt,paid,add_date,paid_date`
  );
  testInvoice = result.rows;
  testInvoice[0].add_date = '2021-02-02T05:00:00.000Z';
  testInvoice[0].paid_date = '2021-02-02T05:00:00.000Z';
});

afterEach(async () => {
  await db.query('DELETE FROM companies');
  await db.query('DELETE FROM invoices');
});

afterAll(async () => {
  //close db connection
  await db.end();
});

describe('GET /invoices', function () {
  test('Gets a list of invoices', async function () {
    const response = await request(app).get(`/invoices`);
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual([
      {
        id: expect.any(Number),
        comp_code: 'windows',
        amt: 1000,
        paid: true,
        add_date: '2021-02-02T05:00:00.000Z',
        paid_date: '2021-02-02T05:00:00.000Z',
      },
    ]);
  });
});

describe('GET /invoices/:id', function () {
  test('Gets a invoice', async function () {
    const response = await request(app).get(`/invoices/${testInvoice[0].id}`);
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual(testInvoice[0]);
  });
});

describe('POST /invoices', function () {
  test('Create a invoice', async function () {
    const response = await request(app).post(`/invoices`).send({
      comp_code: 'windows',
      amt: 1000,
      paid: true,
      add_date: '2021-02-02T05:00:00.000Z',
      paid_date: '2021-02-02T05:00:00.000Z',
    });
    expect(response.statusCode).toEqual(201);
    expect(response.body).toEqual({
      comp_code: 'windows',
      amt: 1000,
      paid: true,
      add_date: '2021-02-02T05:00:00.000Z',
      paid_date: '2021-02-02T05:00:00.000Z',
    });
  });
});

describe('PATCH /invoices/:id', function () {
  test("Update invoice's fields", async function () {
    const response = await request(app)
      .patch(`/invoices/${testInvoice[0].id}`)
      .send({
        comp_code: 'windows',
        amt: 1200,
        paid: false,
        add_date: '02/02/2021',
        paid_date: '02/02/2021',
      });
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({
      id: expect.any(Number),
      comp_code: 'windows',
      amt: 1200,
      paid: false,
      add_date: '2021-02-02T05:00:00.000Z',
      paid_date: '2021-02-02T05:00:00.000Z',
    });
  });
  test('Responds with 404 code Not Found', async function () {
    const response = await request(app).patch(`/invoices/0`);
    expect(response.statusCode).toEqual(404);
  });
});

describe('DELETE /invoices/:id', function () {
  test('Delete invoice', async function () {
    const response = await request(app).delete(
      `/invoices/${testInvoice[0].id}`
    );
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({ message: 'DELETED...' });
  });
  test('Responds with 404 code Not Found', async function () {
    const response = await request(app).patch(`/invoices/0`);
    expect(response.statusCode).toEqual(404);
  });
});
