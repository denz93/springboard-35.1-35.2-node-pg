const {z} = require('zod');

const createIndustryInputSchema = z.object({
  industry: z.string({required_error: 'industry is required'}).min(1),
})

const linkCompanyToIndustryInputSchema = z.object({
  companyCode: z.string({required_error: 'companyCode is required'}).min(1),
  industryCode: z.string({required_error: 'industryCode is required'}).min(1),
})

module.exports = {
  createIndustryInputSchema,
  linkCompanyToIndustryInputSchema
}