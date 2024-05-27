import { ResponseArguments } from "@/modules/main";

export const sendingHttpResponse = (args: ResponseArguments): void => {
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