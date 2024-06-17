import { redisClient } from "@/libs/redis.utils";
import { Request, Response, NextFunction } from 'express';
import { USE_CACHING } from "@/constant/global.config";
import { sendingHttpResponse } from "../responder/http";

export const readFromCache = async (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== 'GET' || USE_CACHING === 'no') {
        return next();
    }
    const redis = await redisClient();
    let objectKey = `${req.headers.client_id}`;
    objectKey = objectKey + `${req.params.logsid ? `:${req.params.logsid}`:``}`;
    objectKey = objectKey + `${req.query?.logtype ? `:${req.query?.logtype}`:``}`;
    objectKey = objectKey + `${req.query?.take ? `:${req.query?.take}`:``}`
    
    if (!objectKey) {
        return next();
    }
    let cachedData = await redis.get(objectKey);
    if (cachedData) {
        sendingHttpResponse({
            res,
            statusCode: "SUCCESS",
            messages: { cache: 'HIT', data: JSON.parse(cachedData) }
        })
        return;
    }
    next()
}

