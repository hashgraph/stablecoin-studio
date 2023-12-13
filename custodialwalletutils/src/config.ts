import * as dotenv from 'dotenv';

dotenv.config();

interface FireblocksConfig {
  apiKey: string;
  apiSecretKey: string;
  baseUrl: string;
}

const getFireblocksConfig = (): FireblocksConfig => {
  return {
    apiKey: process.env.FIREBLOCKS_API_KEY || '',
    apiSecretKey: process.env.FIREBLOCKS_API_SECRET_KEY || '',
    baseUrl: process.env.FIREBLOCKS_BASE_URL || '',
  };
};

const fireblocksConfig = getFireblocksConfig();

export default fireblocksConfig;
