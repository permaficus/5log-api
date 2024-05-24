import dotenv from 'dotenv'
dotenv.config().parsed

export const NODE_ENVIRONMENT = process.env.NODE_ENVIRONMENT || 'DEVELOPMENT'
export const SERVICE_LOCAL_PORT = process.env.SERVICE_LOCAL_PORT || '3000'
export const MESSAGE_BROKER_SERVICE = process.env.MESSAGE_BROKER_SERVICE || 'amqp://guest:guest@localhost:5672'
export const DEFAULT_5LOG_EXCHANGE = process.env.DEFAULT_5LOG_EXCHANGE || '5log-exchange'
export const DEFAULT_5LOG_ROUTING_KEY = process.env.DEFAULT_5LOG_ROUTING_KEY || '5log-routekey'
// redis config
export const REDIS_URL = process.env.REDIS_URL
/**
 * A list for CORS policy
 * Leave empty array to allow from all(*)
 */
export const allowedOrigin: any = ["*"]
