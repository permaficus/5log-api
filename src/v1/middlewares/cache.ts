import { idCompiler, redisClient } from "@/libs/redis.utils";
import { Request, Response, NextFunction } from 'express';
import { USE_CACHING } from "@/constant/global.config";
import { sendingHttpResponse } from "../responder/http";

export const fetchFromCache = async (...args: any[]): Promise<{ id: string, data: any}> => {
    const id = idCompiler({
        baseId: args[0],
        query: {...args[1]},
        params: args[2]
    });
    const redis = await redisClient();
    return {
        id,
        data: await redis.get(id)
    }
}
export const readFromCache = async (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== 'GET' || USE_CACHING === 'no') {
        return next();
    }
    const { id, data} = await fetchFromCache(req.headers.client_id, req.query, req.params)
    if (!id) {
        return next();
    }
    if (data) {
        sendingHttpResponse({
            res,
            statusCode: "SUCCESS",
            messages: { cache: 'HIT', data: JSON.parse(data) }
        })
        return;
    }
    next()
}

