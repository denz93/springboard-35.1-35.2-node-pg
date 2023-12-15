const {mockDB} = require('../db-mock')
const {resetRows, cleanUp} = mockDB()

const app = require('../app')
const {init_db, db} = require('../db')
const request = require('supertest')

describe('Route /industries', () => {
  beforeAll(async () => {
    await init_db()
  })
  afterAll(async () => {
    await cleanUp(db)
  })

  beforeEach(async () => {
    await resetRows(db)
  })
  test('GET /industries', async () => {
    const res = await request(app).get('/industries')
    expect(res.ok).toBeTruthy()
    expect(res.body).toEqual({industries: [
      {code: 'acct', industry: 'Accounting', companies: ['ibm']},
      {code: 'tech', industry: 'Technology', companies: ['apple', 'ibm']},
    ]})
  })
  test('POST /industries', async () => {
    const res = await request(app).post('/industries').send({industry: 'Engineering'})
    expect(res.ok).toBeTruthy()
    expect(res.body).toEqual({industry: {code: 'engineering', industry: 'Engineering'}})
  })

  test('POST /industries/:industryCode/add/:companyCode', async () => {
    let res = await request(app).post('/industries/acct/add/apple').send()
    expect(res.ok).toBeTruthy()
    expect(res.body).toEqual({success: true})
    res = await request(app).get('/industries/acct')
    expect(res.ok).toBeTruthy()
    expect(res.body).toEqual({
      industry: {code: 'acct', industry: 'Accounting', companies: ['ibm', 'apple']},
    })
    await db.query(`SELECT FROM industries_companies WHERE industry_code = 'acct' AND company_code = 'apple'`)
  })

  test('GET /industries/:industryCode', async () => {
    let res = await request(app).get('/industries/tech')
    expect(res.ok).toBeTruthy()
    expect(res.body).toEqual({
      industry: {code: 'tech', industry: 'Technology', companies: ['apple', 'ibm']},
    })
    res = await request(app).get('/industries/acct1')
    expect(res.ok).toBeFalsy()
    expect(res.body).toEqual({
      error: `Industry not found`
    })
  })
})