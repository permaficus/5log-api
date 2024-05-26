import { Request, Response, NextFunction } from "express";
import Logging from "@/model/log.model";
import { ResponseArguments } from "@/modules/main";

const sendingHttpResponse = (args: ResponseArguments): void => {
    const statusCodeNumber = {
        ...args.statusCode == 'ERR_BAD_REQUEST' && { code: 400 },
        ...args.statusCode == 'ERR_UNAUTHORIZED' && { code: 401 },
        ...args.statusCode == 'ERR_BAD_SERVICE' && { code: 500 },
        ...args.statusCode == 'ERR_NOT_FOUND' && { code: 404 },
        ...args.statusCode == 'SUCCESS' && { code: 200 }
    }

    args.res.status(statusCodeNumber.code).json({
        status: args.statusCode,
        code: statusCodeNumber.code,
        ...args.messages
    }).end();
}

export const pushLog = async (req: Request, res: Response, next: NextFunction) => {
    const { client_id } = req.headers;
    try {
        Object.assign(req.body, { client_id })
        const response = await Logging.createEvent(req.body);
        sendingHttpResponse({ 
            res, 
            statusCode: 'SUCCESS', 
            messages: { 'details': response } 
        })
    } catch (error: any) {
        res.status(error.statusCode)
        next(error)
    }
}

export const collectingLogs = async (req: Request, res: Response, next: NextFunction) => {
    const { client_id } = req.headers;
    const { logtype, take } = req.query;
    try {
        const response = await Logging.collectingEvents({
            // @ts-expect-error
            client_id,
            ...req.query && {
                filter: {
                    ...logtype && { logtype },
                    ...take && { take }
                }
            }
        })
        sendingHttpResponse({
            res,
            statusCode: 'SUCCESS',
            messages: { 'result': response }
        })
    } catch (error: any) {
        res.status(error.statusCode);
        next(error)
    }
}

export const removeLogs = async (req: Request, res: Response, next: NextFunction) => {

    if (Object.entries(req.body).length == 0) {
        res.status(400);
        next(new Error(`Cannot process on empty request - ${req.originalUrl}`));
        return;
    }

    const { client_id } = req.headers;
    try {
        // @ts-ignore
        const response: any = await Logging.removingEvent(client_id, req.body.id_list);
        sendingHttpResponse({
            res,
            statusCode: 'SUCCESS',
            messages: {
                result: `Removing ${response.count} data`
            }
        })
    } catch (error: any) {
        res.status(error.statusCode);
        next(error)
    }
}