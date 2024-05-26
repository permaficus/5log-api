import { DB, prismaErrHandler } from "@/libs/prisma.utils";
import { DataSetInterface, FetchLogArguments } from "@/modules/main";

export default class Logging {
    static createEvent = async (payload: DataSetInterface): Promise<object | undefined> => {
        try {            
            const response = await DB.eventLogs.create({
                data: payload,
                omit: {
                    client_id: true
                }
            });
            return response;
        } catch (error: any) {
            prismaErrHandler(error)
        }
    }
    static collectingEvents = async ({...args}: FetchLogArguments): Promise<object | undefined> => {
        try {
            return await DB.eventLogs.findMany({
                where: {
                    client_id: args.client_id,
                    ...args.filter.logtype && { 
                        logLevel: {
                            equals: args.filter.logtype,
                            mode: 'insensitive'
                        }
                    }
                },
                ...args.filter.take && { take: +args.filter.take },
                orderBy: {
                    logDate: 'desc'
                },
                omit: {
                    client_id: true
                }
            })
        } catch (error: any) {
            prismaErrHandler(error)
        }
    }
    static removingEvent = async (client_id: string | undefined, eventID: string[]): Promise<object | undefined> => {
        try {
            return await DB.eventLogs.deleteMany({
                where: {
                    client_id,
                    id: { in: eventID }
                }
            })
        } catch (error: any) {
            prismaErrHandler(error)
        }
    }
}