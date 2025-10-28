export default () => ({
  port: process.env.PORT || 3000,

  nodeEnv: process.env.NODE_ENV || "development",

  clientUrl:
    process.env.NODE_ENV === "production"
      ? process.env.CLIENT_URL_PROD
      : process.env.CLIENT_URL_DEV,

  mongoUri:
    process.env.NODE_ENV === "production" ? process.env.MONGO_URI_PROD : process.env.MONGO_URI_DEV,

  jwtSecret: process.env.JWT_SECRET,
});
