import Joi from 'joi';

export const createCloudAccountSchema = Joi.object({
  provider: Joi.string().valid('AZURE', 'GCP', 'AWS').required(),
  accountId: Joi.string().required(),
  accountName: Joi.string().required(),
  credentials: Joi.object().required(),
});
