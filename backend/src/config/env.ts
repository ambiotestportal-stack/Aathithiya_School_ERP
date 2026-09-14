const requiredEnvVars = [] as const;
const optionalEnvVars = {
  MONGO_URI: 'mongodb://localhost:27017/school-erp',
  JWT_SECRET: 'change-this-in-production',
  PORT: '5000',
  NODE_ENV: 'development',
} as const;

export const validateEnv = () => {
  const missing = requiredEnvVars.filter(v => !process.env[v]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  // Set defaults for optional vars
  for (const [key, defaultValue] of Object.entries(optionalEnvVars)) {
    if (!process.env[key]) process.env[key] = defaultValue;
  }
  if (process.env.JWT_SECRET === 'change-this-in-production' && process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be changed in production!');
  }
};

export const env = {
  get MONGO_URI() { return process.env.MONGO_URI || 'mongodb://localhost:27017/school-erp'; },
  get JWT_SECRET() { return process.env.JWT_SECRET || 'change-this-in-production'; },
  get PORT() { return parseInt(process.env.PORT || '5000'); },
  get NODE_ENV() { return process.env.NODE_ENV || 'development'; },
};
