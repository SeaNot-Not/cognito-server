import * as Joi from "joi";

export default Joi.object({
  PORT: Joi.number().default(4000),
  NODE_ENV: Joi.string().valid("development", "production").default("development"),
  CLIENT_URL_DEV: Joi.string().required(),
  CLIENT_URL_PROD: Joi.string().required(),
  MONGO_URI_DEV: Joi.string().required(),
  MONGO_URI_PROD: Joi.string().required(),
  JWT_SECRET: Joi.string().required(),
});
