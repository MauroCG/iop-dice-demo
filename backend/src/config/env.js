import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const ENV = {
  PORT: process.env.PORT || 5001,
  HOUSE_WALLET_ADDRESS: process.env.HOUSE_WALLET_ADDRESS || 'https://ilp.rafiki.money/house',
  KEY_ID: process.env.KEY_ID || '',
  PRIVATE_KEY_PATH: process.env.PRIVATE_KEY_PATH ? path.resolve(process.env.PRIVATE_KEY_PATH) : '',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
};
