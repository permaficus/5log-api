import { DB, prismaErrHandler } from "@/libs/prisma.utils";
import { DataSetInterface, FetchLogArguments } from "@/modules/main";
import Crypto from 'crypto'

export default class Logging {
    static createEvent = async (payload: DataSetInterface): Promise<object | undefined> => {
        if (!payload.logTicket) {
            // if client using http request and doesnt add log tikcet then we create it for them
            const ticket = Crypto.createHash('sha512').update(Math.random().toString()).digest('hex');
            const start = Math.floor(Math.random() * 11);
            Object.assign(payload, { 
                logTicket: ticket.substring(start, start + 20)
            })
        }
        try {            
            const response = await DB.eventLogs.create({
                data: payload,
                omit: {
                    client_id: true,
                    logTicket: true
                }
            });
            return response;
        } catch (error: any) {
            prismaErrHandler(error)
        }
    }
    static collectingEvents = async (args: FetchLogArguments): Promise<object | undefined> => {
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
    static removingEvent = async (client_id: string | undefined, eventID: string[] & string): Promise<object | any | undefined> => {
        try {
            return await DB.$transaction(async (model) => {
                const count = await model.eventLogs.count({
                    where: {
                        client_id: client_id
                    }
                })
                if (count === 0) {
                    throw new Error(`This request must have client authorization#Code: 401`)
                }
                return model.eventLogs.deleteMany({
                    where: {
                        client_id,
                        ...typeof eventID !== 'object' ? {
                            id: eventID
                        } : { id: { 
                            in: eventID } 
                        }
                    }
                })
            })
        } catch (error: any) {
            prismaErrHandler(error)
        }
    }
}