const {z} = require('zod');
const ExpressError = require('../expressError');

/**
 * 
 * @param {z.Schema} schema 
 * @param {'body'|'params'|'query'} location
 * @returns 
 */
function validateInputMiddleware(schema, location='body') {
  /**
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  return (req, res, next) => {
    try {
      const result = schema.parse(req[location]);
      req.zod = result
      next()
    } catch (err) {
      console.log(err)
      res.status(400).json({
        error: err
      })
    }

  }
}

exports.validateInputMiddleware = validateInputMiddleware