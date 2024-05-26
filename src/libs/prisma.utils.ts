import { PrismaClient, Prisma } from "@prisma/client";

export const DB = new PrismaClient();

class PrismaError extends Error {
    statusCode: number

    constructor(message: string, statusCode: number) {
        super(message)
        this.message = message
        this.statusCode = statusCode
        this.name = this.constructor.name

        Object.setPrototypeOf(this, PrismaError.prototype)
    }
}
export const prismaErrHandler = (error: any) => {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        const { meta, code, message } = error;
        // @ts-ignore
        if (code === 'P2010' && /(kind\: I\/O error)|(connection refused)/gi.test(meta?.message)) {
            throw new PrismaError('We have trouble connecting to our database server, Please try again later', 500);
        }
        // @ts-ignore
        throw new PrismaError(meta?.cause || message, 400);
    }
    if (error instanceof Prisma.PrismaClientInitializationError) {
        throw new PrismaError('We have trouble connecting to our database server, Please try again later', 500);
    }
    if (/code.*[404,401]/gi.test(error.message)) {
        const errorMessage = error.message.split('#')[0];
        let errorCode = error.message.split('#')[1];
        errorCode = errorCode.replace('Code: ', '')
        throw new PrismaError(errorMessage, +errorCode)
    }
    throw new PrismaError('We have a slight problem with our backend. Please try again later', 500)
}