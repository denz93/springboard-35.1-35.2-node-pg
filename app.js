/** BizTime express application. */


const express = require("express");

const app = express();
const ExpressError = require("./expressError")
const companyRoute = require('./routes/companies')
const invoiceRoute = require('./routes/invoices')
const industryRoute = require('./routes/industries')

app.use(express.json());
app.use('/companies', companyRoute)
app.use('/invoices', invoiceRoute)
app.use('/industries', industryRoute)

/** 404 handler */

app.use(function(req, res, next) {
  const err = new ExpressError("Not Found", 404);
  return next(err);
});


/** express error */
app.use((err, req, res, next) => {
  if (err instanceof ExpressError) {
    res.status(err.status);
    return res.json({ error: err.message });
  } else {
    next(err)
  }
})

/** general error handler */

app.use((err, req, res, next) => {
  res.status(err.status || 500);

  return res.json({
    error: err,
    message: err.message
  });
});

module.exports = app;
