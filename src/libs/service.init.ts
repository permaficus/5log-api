import express, { Express } from 'express'
import cors from 'cors'
import {
    SERVICE_LOCAL_PORT,
    NODE_ENVIRONMENT,
    allowedOrigin
} from "@/constant/global.config"
import { router as v1 } from "@/v1/routes/detault"
import { badRequest } from '@/v1/middlewares/errHandler'

const httpServer: Express = express()
const httpServerInit = async () => {
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
    }))

    httpServer.use('/api/v1', v1);
    httpServer.use(badRequest)
}

export { httpServerInit, httpServer, SERVICE_LOCAL_PORT, NODE_ENVIRONMENT }