import { Request, Response, NextFunction } from "express";
import Logging from "@/model/log.model";
import { DataProcessingArguments } from "@/modules/main";
import { sendingHttpResponse } from "@/v1/responder/http";
import { publishMessage } from "@/v1/responder/amqp";
import { errStatusMessage } from "@/v1/middlewares/errHandler";
import { idCompiler, redisCache } from "@/libs/redis.utils";
import { USE_CACHING } from "@/constant/global.config";

export const processingData = async (args: DataProcessingArguments): Promise<void> => {
    const { client_id }: any = args.headers || args.body;
    const { logtype, take } = args.body.filter || args.query || {};
    const { logsid }: any = args.body.id_list || args.params || {};
    const { req, res, next }: any = args.protocol;

    /**
     * TODO!
     * * We need a token or reference ID to prevent duplicate payloads from being 
     * * stored in case of a noAck message being resend.
     */
    if (args.protocol == 'amqp' && args.method == 'POST') {
        if (await Logging.duplicateLogTicket(args.body.logTicket)) {
            return;
        }
    }

    try {
        const taskMap = {
            ...args.method == 'POST' && { response: await Logging.createEvent(args.body) },
            ...args.method == 'GET' && { response: await Logging.collectingEvents({
                client_id,
                filter: {
                    ...take && { take },
                    ...logtype && { logtype }
                }
            })},
            ...args.method == 'DELETE' && { response: await Logging.removingEvent(
                client_id,
                logsid
            )}
        }

        const respondMessage = {
            ...args.method == 'POST' && { details: taskMap.response },
            ...args.method == 'GET' && { data: taskMap.response },
            ...args.method == 'DELETE' && { result: `Removing ${taskMap.response.count} data` }
        }
        // comparing fetched data from model and redis
        if (args.method === 'GET' && respondMessage.data && USE_CACHING === 'yes') {
            const key = idCompiler({
                baseId: client_id,
                query: {
                    ...logtype ? { logtype } : {},
                    ...take ? { take } : {}
                },
                ...logsid ? { params: logsid } : {}
            });
            console.log(key)
            const cachedData = await redisCache({ command: 'get', id: key, data: '' });
            // if the response data is newer or different than the cached, set new cache for this result
            if (JSON.stringify(respondMessage.data) !== cachedData) {
                await redisCache({ command: 'set', id: key, data: JSON.stringify(respondMessage.data)})
            }
        }

        if (typeof args.protocol == 'object') {
            sendingHttpResponse({
                res,
                statusCode: 'SUCCESS',
                messages: {...respondMessage}
            })
        }
        if (typeof args.protocol === 'string') {
            await publishMessage({
                queue: args.origin?.queue,
                routingKey: args.origin?.routingKey,
                message: {
                    status: 'SUCCESS',
                    code: 200,
                    ...respondMessage
                }
            })
        }
    } catch (error: any) {
        if (typeof args.protocol == 'object') {
            res.status(error.statusCode);
            next(error);
            return;
        }
        // replying back to origin exchange / queue=
        await publishMessage({
            queue: args.origin?.queue,
            routingKey: args.origin?.routingKey,
            message: {
                status: errStatusMessage[error.statusCode].message,
                code: error.statusCode,
                details: error.message
            }
        });
        // this throwing new Error is for triggering the nack.msg on consumer
        throw new Error(error.message)
    }
}

export const handleHttpRequest = async (req: Request, res: Response, next: NextFunction) => {
    // prevent user for providing param on non-param required routing
    if (['POST', 'GET'].includes(req.method) && req.params.logsid) {
        res.status(404);
        next()
        return;
    }
    // reject request on empty request body
    if (req.method === 'DELETE' && !req.params.logsid && Object.entries(req.body).length === 0) {
        next(new Error(`Cannot process on empty request - ${req.originalUrl}`));
        return;
    }
    // assigning client_id into req.body
    if (req.method === 'POST') {
        Object.assign(req.body, { client_id: req.headers.client_id })
    }

    await processingData({
        protocol: {
            req,
            res,
            next
        },
        method: req.method,
        body: req.body,
        headers: req.headers,
        query: req.query,
        params: req.params
    })
}