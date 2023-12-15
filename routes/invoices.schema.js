const {z} = require('zod');

const createInvoiceInputSchema = z.object({
  comp_code: z.string({required_error: 'comp_code is required'}),
  amt: z.number({required_error: 'amt is required', coerce: true}),
})

const updateInvoiceInputSchema = createInvoiceInputSchema
  .pick({amt: true})
  .merge(z.object({
    paid: z.boolean().default(false)
  }))

module.exports = {
  createInvoiceInputSchema,
  updateInvoiceInputSchema
}