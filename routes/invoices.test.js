const {mockDB} = require('../db-mock')
const {resetRows, cleanUp} = mockDB()

const app = require('../app')
const {init_db, db} = require('../db')

const request = require('supertest')

describe('Route /invoices', () => {
  const addDate = new Date()
  addDate.setHours(0)
  addDate.setMinutes(0)
  addDate.setSeconds(0)
  addDate.setMilliseconds(0)

  beforeAll(async () => {
    await init_db()
  })
  afterAll(async () => {
    await cleanUp(db)
  })
  beforeEach(async() => {
    await resetRows(db)
  })
  test('GET /', async () => {
    const res = await request(app).get('/invoices')
    
    expect(res.ok).toBeTruthy()
    expect(res.body).toEqual({invoices: [
      {id: 1, amt: 100, paid: false, comp_code: 'apple', paid_date: null, add_date: addDate.toISOString()},
      {id: 2, amt: 200, paid: false, comp_code: 'apple', paid_date: null, add_date: addDate.toISOString()},   
      {id: 3, amt: 300, paid: true, comp_code: 'apple', paid_date: new Date("2018-01-01 00:00:00").toISOString(), add_date: addDate.toISOString()}, 
      {id: 4, amt: 400, paid: false, comp_code: 'ibm', paid_date: null, add_date: addDate.toISOString()},
    ]})
  })
  test('GET /:id', async () => {
    const res = await request(app).get('/invoices/1')
    expect(res.ok).toBeTruthy()
    expect(res.body).toEqual({
      invoice: {
        id: 1,
        amt: 100,
        paid: false,
        comp_code: 'apple',
        paid_date: null,
        add_date: addDate.toISOString()
      }
    })
  })
  test('POST /', async () => {
    const res = await request(app).post('/invoices').send({comp_code: 'ibm', amt: 500})
    expect(res.ok).toBeTruthy()
    expect(res.body).toEqual({
      invoice: {
        id: 5,
        amt: 500,
        paid: false,
        comp_code: 'ibm',
        paid_date: null,
        add_date: addDate.toISOString()
      }
    })
  })
  test('PUT /:id', async () => {
    /**
     * PUT /invoices/:id
     * • If paying unpaid invoice: sets paid_date to today
     * • If un-paying: sets paid_date to null
     * • Else: keep current paid_date
     * Returns: {invoice: {id, comp_code, amt, paid, add_date, paid_date}}
     */
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    let res = await request(app).put('/invoices/1').send({amt: 500})
    expect(res.ok).toBeTruthy()
    expect(res.body).toEqual({
      invoice: {
        id: 1,
        amt: 500,
        paid: false,
        comp_code: 'apple',
        paid_date: null,
        add_date: addDate.toISOString()
      }
    })
    res = await request(app).put('/invoices/1').send({amt: 500, paid: true})
    expect(res.ok).toBeTruthy()
    expect(res.body).toEqual({
      invoice: {
        id: 1,
        amt: 500,
        paid: true,
        comp_code: 'apple',
        paid_date: today.toISOString(),
        add_date: addDate.toISOString()
      }
    })
    res = await request(app).put('/invoices/1').send({amt: 500, paid: false})
    expect(res.ok).toBeTruthy()
    expect(res.body).toEqual({
      invoice: {
        id: 1,
        amt: 500,
        paid: false,
        comp_code: 'apple',
        paid_date: null,
        add_date: addDate.toISOString()
      }
    })
  })

  test('DELETE /:id', async () => {
    const res = await request(app).delete('/invoices/1')
    expect(res.ok).toBeTruthy()
    expect(res.body).toEqual({status: 'deleted'})
  })
})