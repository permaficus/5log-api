import { Request, Response, NextFunction } from "express";

export const errStatusMessage: any = {
    400: {
        message: 'ERR_BAD_REQUEST'
    },
    401: {
        message: 'ERR_UNAUTHORIZED'
    },
    500: {
        message: 'ERR_BAD_SERVICE'
    },
    404: {
        message: 'ERR_NOT_FOUND'
    }
}
export const badRequest = async ( err: any, req: Request, res: Response, next: NextFunction ) => {
    if (err instanceof SyntaxError && 'body' in err) {
        res.status(400).send({
            status: 'ERR_BAD_REQUEST',
            code: res.statusCode,
            details: `Oops..there is something wrong with your request`
        }).end();
        return;
    }

    next(err)
}
export const PathNotFound = async (req: Request, res: Response, next: NextFunction) => {
    res.status(404);
    next(new Error(`Path Not Found - ${req.originalUrl}`));
}
export const errHandler = async (err: any, req: Request, res: Response, next: NextFunction ) => {
    if (res.headersSent) {
        return next(err)
    }
    const statusCode = res.statusCode || 500;
    res.status(statusCode).json({
        status: errStatusMessage[statusCode].message,
        code: statusCode,
        details: err.message
    }).end();
}