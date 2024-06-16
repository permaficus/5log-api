import { Request, Response, NextFunction } from "express";

export const challengeAuthentication = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.headers.client_id) {
        res.status(401);
        next(new Error(`Authentication Failed - ${req.originalUrl}`));
        return;
    }
    // next contact auth service
    next();
}