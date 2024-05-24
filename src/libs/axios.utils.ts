import axios from 'axios';
import { WebhookBodyInterface } from '@/modules';
import Crypto from 'crypto'

const connector = axios.create()

class WebhookErrors extends Error {
    statusCode: number
    
    constructor(message: string, statusCode: number) {
        super(message)
        this.message = message
        this.statusCode = statusCode
        this.name = this.constructor.name

        Object.setPrototypeOf(this, WebhookErrors.prototype)
    }
}
/**
 * 
 * @argument {URL, data} 
 * @returns 
 * @description: this method only invoked when rabbitmq producer cannot connect to rabbitmq instance server
 */
export const webhook = async ({...args}: WebhookBodyInterface): Promise<void> => {
    try {
        // start creating signature key for client to validate
        const signKey = Crypto.createHash('sha512');
        // variable that we use is client_id only
        // @ts-ignore
        signKey.update(args.data?.client_id).digest('hex')
        // assigning this signkey into args.data
        Object.assign(args.data, { signature_key: signKey })
        return await connector.post(args.url, args.data, {
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json'
            }
        })
    } catch (error: any) {
        const { status } = error.response
        throw new WebhookErrors(error.message, status)
    }
}