/**
 * HTTP Response & RabbitMQ Fallback Response
 */
export enum LoggingLevel {
    ERROR,
    WARNING,
    INFO,
    UNKNOWN
}

export type LogLevelString = keyof typeof LoggingLevel;

export declare interface ResponseArguments {
    res: any
    statusCode: 'SUCCESS' | 'ERR_BAD_REQUEST' | 'ERR_BAD_SERVICE' | 'ERR_NOT_FOUND' | 'ERR_UNAUTHORIZED'
    details?: string | string[] | object | undefined
}

export type MessageOrigin = {
    queue: string
    routingKey: string
    webhook?: {
        url: string
        method: string
        headers?: string
    }
}

export interface WebhookBodyInterface {
    url: string
    data: object | string[]
}

/**
 * POST & Message Payload
 */

export interface DataSetInterface {
    logLevel: LogLevelString
    logDate: Date
    source: object | string[] | []
    eventCode: string
    destination: string
    environment: string
    errorDescription: string
    messageOrigin?: MessageOrigin
}

/**
 * RabbitMQ initiation config & interface
 */

export interface BrokerExchangeInterface {
    channel: any
    name: string | undefined | null
    type: 'direct' | 'fanout' | 'headers' | 'topics'
    durable: boolean
    autoDelete?: boolean
    internal?: boolean
}

export interface QueueTypeInterface {
    name: string | undefined | null
    channel: any,
    options?: {
        durable: boolean,
        arguments?: {
            'x-queue-type'?: 'classic' | 'quorum' | 'stream',
            'x-dead-letter-exchange'?: string | string[] | null,
            'x-dead-letter-routing-key'?: string | string[] | null
        }
    }
}

/**
 * Redis Argument
 */

export type RedisCommandArgument = string | Buffer

export interface RedisArgumentInterface {
    command: string,
    id: string,
    data: number | RedisCommandArgument
}
