import { DB, prismaErrHandler } from "@/libs/prisma.utils";
import { DataSetInterface } from "@/modules/main";

export default class Logging {
    static createEvent = async (payload: DataSetInterface): Promise<any> => {
        try {            
            const response = await DB.eventLogs.create({
                data: payload
            });
            return response;
        } catch (error: any) {
            prismaErrHandler(error)
        }
    }
}