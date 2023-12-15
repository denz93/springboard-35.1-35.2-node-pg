const {mockDB} = require('../db-mock')
const {resetRows, cleanUp} = mockDB()

const app = require('../app')
const {init_db, db} = require('../db')
const request = require('supertest')

describe('ROUTE companies', () => {
  beforeAll(async () => {
    await init_db()
    
  })
  afterAll(async () => {
    await cleanUp(db)
  })
  beforeEach(async () => {
    await resetRows(db)
  })

  test('GET /', async () => {
    const res = await request(app).get('/companies')
    expect(res.ok).toBeTruthy()
    expect(res.body).toEqual({companies: [
      {code: 'apple', name: 'Apple Computer', description: 'Maker of OSX.', industries: 'Technology'},
      {code: 'ibm', name: 'IBM', description: 'Big blue.', industries: 'Technology,Accounting'},
    ]})
  })
  test('POST /', async () => {
    const res = await request(app).post('/companies').send({name: 'Test Company', description: 'test'})
    expect(res.ok).toBeTruthy()
    expect(res.body).toEqual({company: {code: 'test-company', name: 'Test Company', description: 'test'}})
  })
  test('GET /:code', async () => {
    const res = await request(app).get('/companies/ibm')
    expect(res.ok).toBeTruthy()
    expect(res.body).toEqual({company: {code: 'ibm', name: 'IBM', description: 'Big blue.', industries: 'Accounting,Technology'}})
  })
  test('PUT /:code', async () => {
    const res = await request(app).put('/companies/ibm').send({name: 'Test Company 2', description: 'test'})
    expect(res.ok).toBeTruthy()
    expect(res.body).toEqual({company: {code: 'ibm', name: 'Test Company 2', description: 'test'}})
  })
  test('DELETE /:code', async () => {
    const res = await request(app).delete('/companies/ibm')
    expect(res.ok).toBeTruthy()
    expect(res.body).toEqual({status: 'deleted'})
    const result = await db.query(`SELECT * FROM companies`)
    expect(result.rowCount).toEqual(1)
  })
})