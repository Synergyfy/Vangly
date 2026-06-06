import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'staging', 'production')
    .default('development'),
  PORT: Joi.number().integer().min(1).max(65535).default(8001),

  DATABASE_URL: Joi.string().uri().required(),

  JWT_ACCESS_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  JWT_ACCESS_TTL: Joi.string().default('15m'),
  JWT_REFRESH_TTL_DAYS: Joi.number().integer().min(1).max(60).default(7),

  CORS_ORIGINS: Joi.string()
    .allow('')
    .default('http://localhost:3000,http://localhost:3001'),

  BODY_JSON_LIMIT: Joi.string().default('100kb'),

  THROTTLE_TTL_MS: Joi.number().integer().min(1000).default(60_000),
  THROTTLE_LIMIT: Joi.number().integer().min(1).default(120),
  THROTTLE_AUTH_LIMIT: Joi.number().integer().min(1).default(10),
  THROTTLE_PUBLIC_SUBMIT_LIMIT: Joi.number().integer().min(1).default(30),

  SWAGGER_ENABLED: Joi.boolean().default(true),
});

export interface AppConfig {
  NODE_ENV: 'development' | 'test' | 'staging' | 'production';
  PORT: number;
  DATABASE_URL: string;
  JWT_ACCESS_SECRET: string;
  JWT_REFRESH_SECRET: string;
  JWT_ACCESS_TTL: string;
  JWT_REFRESH_TTL_DAYS: number;
  CORS_ORIGINS: string;
  BODY_JSON_LIMIT: string;
  THROTTLE_TTL_MS: number;
  THROTTLE_LIMIT: number;
  THROTTLE_AUTH_LIMIT: number;
  THROTTLE_PUBLIC_SUBMIT_LIMIT: number;
  SWAGGER_ENABLED: boolean;
}
