const express = require('express')
const router = express.Router()
const {db, errors: {DuplicateKeyError, DatabaseError, InsertUpdateKeyViolateError}} = require('../db')
const {createIndustryInputSchema, linkCompanyToIndustryInputSchema } = require('./industries.schema')
const {validateInputMiddleware} = require('./validate.middleware')
const {slugify} = require('./companies.slugify')
module.exports = router

router.get('/', async (req, res) => {
  const result = await db.query(`
    SELECT i.code, i.industry, ARRAY_AGG(ic.company_code) companies
    FROM industries i
    LEFT JOIN industries_companies ic ON i.code = ic.industry_code
    GROUP BY i.code, i.industry
  `)
  res.json({
    industries: result.rows
  })
})

router.get('/:industryCode', async (req, res) => {
  const {industryCode} = req.params
  const result = await db.query(`
    SELECT i.code, i.industry, ARRAY_AGG(ic.company_code) companies
    FROM industries i
    LEFT JOIN industries_companies ic ON i.code = ic.industry_code
    WHERE i.code = $1
    GROUP BY i.code, i.industry
  `, [industryCode])
  if (result.rowCount === 0) {
    return res.status(404).json({error: 'Industry not found'})
  }
  res.json({
    industry: result.rows[0]
  })
})

router.post('/', validateInputMiddleware(createIndustryInputSchema), async (req, res) => {
  const {industry} = req.zod
  try {
    const result = await db.query('INSERT INTO industries (code, industry) VALUES ($1, $2) RETURNING code, industry', [slugify(industry), industry])
    res.json({
      industry: result.rows[0]
    })

  } catch(err) {
    if (DatabaseError.fromRawError(err) instanceof DuplicateKeyError) {
      return res.status(400).json({
        error: `Industry '${industry}' already exists`
      })
    }
    throw err
  }
})

router.post('/:industryCode/add/:companyCode',
 validateInputMiddleware(linkCompanyToIndustryInputSchema, 'params'),
 async (req, res) => {
  const {companyCode, industryCode} = req.zod
  //Insert if not exists
  try {
    const result = await db.query(`
      INSERT INTO industries_companies (industry_code, company_code)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
    `, [industryCode, companyCode])
    res.json({success: true})
  } catch (err) {
    if (DatabaseError.fromRawError(err) instanceof InsertUpdateKeyViolateError) {
      return res.status(400).json({success: false, error: 'Company code or industry code does not exist'})
    }
    res.status(400).json({success: false})
  }

})
