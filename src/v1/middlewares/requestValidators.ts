import { validateSchema, ValidationError } from "@/libs/joi.utils";
import { CallbackFunction, MessagePayload } from "@/modules/main";
import { NextFunction, Request, Response } from "express";

// validation middleware for amqp protocol
export const validateIncommingMessage = async (msg: MessagePayload, callback: CallbackFunction) => {
    if (Object.entries(msg.payload).length === 0) {
        return callback(new Error(`Cannot process on empty request`))
    }
    try {
        await validateSchema(msg, 'amqp');
        return callback(null)
    } catch (error: any) {
        return callback(error)
    }
}
// validation middleware for http protocol
export const validateRequest = async (req: Request, res: Response, next: NextFunction) => {
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