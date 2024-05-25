
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

export interface ResponseArguments {
    res: any
    statusCode: 'SUCCESS' | 'ERR_BAD_REQUEST' | 'ERR_BAD_SERVICE' | 'ERR_NOT_FOUND' | 'ERR_UNAUTHORIZED'
    messages: object
}


export type MessageOrigin = {
    queue: string
    routingKey: string
    fallback?: {
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
export type ErrorSourceProps = {
    app_name?: string
    app_version?: string
    package_name?: string
    hostname?: string
    ip_address?: string
}

export interface FetchLogArguments {
    client_id: string
    filter: {
        take?: number
        logtype?: string
    }
}

export interface DataSetInterface {
    logLevel: LogLevelString
    client_id: string
    logDate: Date
    source: object | ErrorSourceProps
    eventCode: string
    destination?: string
    environment: string
    errorDescription: string
    messageOrigin?: MessageOrigin
}

export interface WHDatasetInterface {
    destination: string
    status: number
    requestedAt: Date
    errorMessage?: string
    retryAt?: Date
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
