import { Request, Response, NextFunction } from "express";
import Logging from "@/model/log.model";
import { DataProcessingArguments } from "@/modules/main";
import { sendingHttpResponse } from "@/v1/responder/http";
import { publishMessage } from "@/v1/responder/amqp";
import { errStatusMessage } from "@/v1/middlewares/errHandler";

export const processingData = async (args: DataProcessingArguments): Promise<void> => {
    const { client_id }: any = args.headers || args.body;
    const { logtype, take } = args.body.filter || args.query || {};
    const { logsid }: any = args.body.id_list || args.params || {};
    const { req, res, next }: any = args.protocol;

    if (args.method === 'POST' && typeof args.protocol == 'object') {
        Object.assign(args.body, { client_id })
    }
    if (args.method === 'DELETE' && typeof args.protocol == 'object' && !logsid && Object.entries(args.body).length === 0) {
        next(new Error(`Cannot process on empty request - ${req.originalUrl}`));
        return;
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