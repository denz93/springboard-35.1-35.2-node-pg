const express = require('express');
const ExpressError = require('../expressError');
const router = express.Router();
const {db, errors: {DuplicateKeyError}} = require("../db");
const { validateInputMiddleware } = require('./validate.middleware');
const { createCompanyInputSchema, editCompanyInputSchema } = require('./companies.schema');
const { slugify } = require('./companies.slugify')

router.get('/', async (req, res) => {
  const result = await db.query(`
    SELECT c.code, c.name, c.description, STRING_AGG(i.industry, ',') industries
    FROM companies c
    LEFT JOIN industries_companies ic ON c.code = ic.company_code
    LEFT JOIN industries i ON ic.industry_code = i.code
    GROUP BY c.code, c.name`)
  res.json({
    companies: result.rows
  })
})

router.get('/:code', async (req, res, next) => {
  try {
    const code = req.params.code
    const result = await db.query(`
    SELECT c.code, c.name, c.description, STRING_AGG(i.industry, ',') industries
    FROM companies c
    JOIN industries_companies ic ON c.code = ic.company_code
    JOIN industries i ON ic.industry_code = i.code
    WHERE c.code = $1
    GROUP BY c.code, c.name`, [code])
    if (result.rowCount === 0) {
      return next(new ExpressError(`No such company: ${code}`, 404))
    }
    res.json({
      company: result.rows[0]
    })

  } catch (err) {
    next(err)
  }
})

router.post('/', validateInputMiddleware(createCompanyInputSchema), async (req, res, next) => {
  const {name, description} = req.zod
  let slug = slugify(name);
  try {
    let isSlugTaken = await db.query('SELECT * FROM companies WHERE code = $1', [slug]);
    while (isSlugTaken.rowCount > 0) {
      slug = slugify(name, slug)
      isSlugTaken = await db.query('SELECT * FROM companies WHERE code = $1', [slug]);
    }
    const company = await db.query(
      'INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description', 
      [slug, name, description])
    res.status(201).json({
      company: company.rows[0]
    })

  } catch (err) {
    if (DuplicateKeyError.fromRawError(err)) {
      return res.status(400).json({
        error: `Code '${slug}' already exists`
      })
    }
    throw err
  }
  
})

router.put('/:code',
  validateInputMiddleware(createCompanyInputSchema.pick('code'), 'params'),
  validateInputMiddleware(editCompanyInputSchema, 'body'),
  async (req, res, next) => {
    const code = req.params.code 
    const {name, description} = req.zod
    try {
      const result = await db.query(
        'UPDATE companies SET name = $1, description = $2 WHERE code = $3 RETURNING code, name, description',
        [name, description, code]
      )
      if (result.rowCount === 0) {
        return res.status(404).json({error: 'Company not found'})
      }
      res.status(200).json({
        company: result.rows[0]
      })
    } catch(err) {
      console.log({err})
      res.status(404).json({error: 'Company not found'})
    }
  }
)

router.delete('/:code',
  validateInputMiddleware(createCompanyInputSchema.pick('code'), 'params'),
  async (req, res, next) => {
    const code = req.params.code 
    try {
      const result = await db.query(
        'DELETE FROM companies WHERE code = $1 RETURNING code',
        [code]
      )
      if (result.rowCount === 0) {
        return res.status(404).json({error: 'Company not found'})
      }
      res.status(200).json({
        status: 'deleted'
      })
    } catch (err) {
      console.log({err})
      res.status(404).json({error: 'Company not found'})
    }
  }
)

module.exports = router