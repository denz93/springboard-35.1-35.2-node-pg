const {z} = require('zod');

const createCompanyInputSchema = z.object({
  name: z.string({required_error: 'name is required'}),
  description: z.string({required_error: 'description is required'}),
})

const editCompanyInputSchema = createCompanyInputSchema.omit({code: true})

module.exports = {
  createCompanyInputSchema,
  editCompanyInputSchema
}

