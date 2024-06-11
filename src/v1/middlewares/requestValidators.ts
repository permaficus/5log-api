import { validateSchema, ValidationError } from "@/libs/joi.utils";
import { CallbackFunction, MessagePayload } from "@/modules/main";
import { NextFunction, Request, Response } from "express";

// validation middleware for amqp protocol
export const validateIncommingMessage = async (msg: MessagePayload, callback: CallbackFunction) => {
    if (!msg.payload || !msg.origin || !msg.task) {
        return callback(JSON.stringify({
            status: 'ERR_BAD_REQUEST',
            code: 400,
            details: `Cannot process an empty request`
        }))
    }
    try {
        await validateSchema(msg, 'amqp');
        return callback(null)
    } catch (error: any) {
        let _sco = error instanceof ValidationError;
        return callback(JSON.stringify({
            status: _sco ? 'VALIDATION_ERROR' : 'ERR_UNKNOWN',
            code: _sco ? 400 : error.code || 'n/a',
            details: _sco ? error.message.replace(/"/g, '') : error.message
        }))
    }
}
// validation middleware for http protocol
export const validateRequest = async (req: Request, res: Response, next: NextFunction) => {
    // go to next router on get & delete method
    if (['GET', 'DELETE'].includes(req.method)) {
        return next();
    }
    if (Object.entries(req.body).length == 0) {
        res.status(400);
        next(new Error(`Cannot process on empty request - ${req.originalUrl}`));
        return;
    }
    try {
        await validateSchema(req.body, 'http');
        next();
    } catch (error: any) {
        if (error instanceof ValidationError) {
            res.status(400).json({
                status: 'VALIDATION_ERROR',
                code: 400,
                details: error.message.replace(/"/g, '')
            }).end();
            return;
        }

        next(error)
    }
}