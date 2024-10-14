const dotenv = require('dotenv');
const mongoose = require('mongoose');
const { getEnvVar, getEnvSecret } = require('./services/config.service');

const { NODE_ENV } = process.env;
const dotenvPath = NODE_ENV ? `.env.${NODE_ENV}` : '.env.development';
dotenv.config({ path: dotenvPath });

const initialize = async () => {
  try {
    const mongoDbUrl = await getEnvVar('MONGODB_URL');
    const mongoDbName = 'logs';
    const mongoDbPassword = await getEnvSecret('MONGODB-PASSWORD');
    const mongoDbConnectionString = mongoDbUrl
      .replace('[MONGODB_PASSWORD]', mongoDbPassword)
      .replace('[MONGODB_DBNAME]', mongoDbName);

    mongoose.connect(mongoDbConnectionString);
    mongoose.pluralize(null);
    mongoose.set('debug', true);
  } catch (error) {
    logger.error(error);
  }
};

initialize().then(() => {
  console.log('MongoDB connected');
});
