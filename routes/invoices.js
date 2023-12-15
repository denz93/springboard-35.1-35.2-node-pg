const router = require('express').Router()
const {db, errors: {DuplicateKeyError}} = require("../db");
const { validateInputMiddleware } = require('./validate.middleware');
const { createInvoiceInputSchema, updateInvoiceInputSchema } = require('./invoices.schema');

router.get('/', async (req, res) => {
  const result = await db.query('SELECT * FROM invoices')
  res.json({
    invoices: result.rows
  })
})

router.get('/:id', async (req, res) => {
  const id = req.params.id
  const result = await db.query('SELECT * FROM invoices WHERE id = $1', [id])
  if (result.rowCount === 0) {
    return res.status(404).json({error: 'Invoice not found'})
  }
  res.json({
    invoice: result.rows[0]
  })
})

router.post('/', 
  validateInputMiddleware(createInvoiceInputSchema), 
  async (req, res) => {
    const {comp_code, amt} = req.zod
    const result = await db.query(
      'INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING id, comp_code, amt, paid, add_date, paid_date', 
      [comp_code, amt])
    res.status(201).json({
      invoice: result.rows[0]
    })
})

router.put('/:id',
  validateInputMiddleware(updateInvoiceInputSchema),
  async (req, res) => {
    const {id} = req.params
    const {amt, paid} = req.zod
    const invoice = await db.query(`SELECT * FROM invoices WHERE id = $1`, [id])
    if (invoice.rowCount === 0) {
      return res.status(404).json({error: 'Invoice not found'})
    }
    let result = null;

    if (paid === true && invoice.rows[0].paid === false) {
      result = await db.query(
        'UPDATE invoices SET amt = $1, paid = $2, paid_date = $3 WHERE id = $4 RETURNING id, comp_code, amt, paid, add_date, paid_date',
        [amt, paid, new Date(), id]
      )
    } else if (paid === false && invoice.rows[0].paid === true) {
      result = await db.query(
        'UPDATE invoices SET amt = $1, paid = $2, paid_date = $3 WHERE id = $4 RETURNING id, comp_code, amt, paid, add_date, paid_date',
        [amt, paid, null, id]
      )
    } else {
      result = await db.query(
        'UPDATE invoices SET amt = $1 WHERE id = $2 RETURNING id, comp_code, amt, paid, add_date, paid_date',
        [amt, id]
      )
    }
    res.json({
      invoice: result.rows[0]
    })
  }
)

router.delete('/:id', async (req, res) => {
  const {id} = req.params
  const result = await db.query('DELETE FROM invoices WHERE id = $1', [id])
  if (result.rowCount === 0) {
    return res.status(404).json({error: 'Invoice not found'})
  }
  res.json({status: 'deleted'})
})

router.get('/companies/:code', async (req, res) => {
  const {code} = req.params
  const result = await db.query(`
    SELECT * FROM companies WHERE code = $1
  `, [code])
  if (result.rowCount === 0) {
    return res.status(404).json({error: 'Company not found'})
  }
  const invoices = await db.query(`
    SELECT * FROM invoices WHERE comp_code = $1
  `, [code])
  res.json({
    company: result.rows[0],
    invoices: invoices.rows
  })
})



module.exports = router