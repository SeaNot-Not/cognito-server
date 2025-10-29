export default () => ({
  port: parseInt(process.env.PORT || "4000", 10),

  nodeEnv: process.env.NODE_ENV || "development",

  clientUrl: (process.env.NODE_ENV === "production"
    ? process.env.CLIENT_URL_PROD
    : process.env.CLIENT_URL_DEV) as string,

  mongoUri: (process.env.NODE_ENV === "production"
    ? process.env.MONGO_URI_PROD
    : process.env.MONGO_URI_DEV) as string,

  jwtSecret: process.env.JWT_SECRET as string,
});
