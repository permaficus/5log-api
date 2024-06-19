import express, { Express } from 'express'
import cors from 'cors'
import {
    SERVICE_LOCAL_PORT,
    NODE_ENVIRONMENT,
    allowedOrigin,
    APP_BASE_URL
} from "@/constant/global.config";
import { router as v1 } from "@/v1/routes/detault";
import { badRequest } from '@/v1/middlewares/errHandler';
import SwaggerUI from 'swagger-ui-express';
import apiDocs from '@/api-docs/api.json';

const httpServer: Express = express()
const httpServerInit = async (port?: number) => {
    httpServer.use(express.urlencoded({ extended: true }))
    httpServer.use(express.json())
    httpServer.use(cors({
        ...allowedOrigin.length !== 0 ? { origin: (origin, callback) => {
            if (!origin) return callback(null, true);
            if (!allowedOrigin.includes(origin)) {
                const error = new Error(`Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource at ${origin}.`);
                delete error.stack
                return callback(error, false)
            }
            return callback(null, true)
        }} : {}
    }));
    apiDocs.servers[0].url = `${APP_BASE_URL}:${port}`
    httpServer.use('/api-docs', SwaggerUI.serve, SwaggerUI.setup(apiDocs, { customSiteTitle: '5log API Documentation' }))
    httpServer.use('/api/v1', v1);
    httpServer.use(badRequest)
}

export { httpServerInit, httpServer, SERVICE_LOCAL_PORT, NODE_ENVIRONMENT }