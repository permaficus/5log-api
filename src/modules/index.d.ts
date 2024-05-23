/**
 * HTTP Response & RabbitMQ Fallback Response
 */
enum LoggingLevel {
    ERROR,
    WARNING,
    INFO,
    UNKNOWN
}

type LogLevelString = keyof typeof LoggingLevel;

interface ResponseArguments {
    res: any
    statusCode: 'SUCCESS' | 'ERR_BAD_REQUEST' | 'ERR_BAD_SERVICE' | 'ERR_NOT_FOUND'
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

export const sendingHttpResponse = ({ res, statusCode, details }: ResponseArguments): void => {
    const statusCodeNumber = {
        ...statusCode == 'ERR_BAD_REQUEST' && { code: 400 },
        ...statusCode == 'ERR_UNAUTHORIZED' && { code: 401 },
        ...statusCode == 'ERR_BAD_SERVICE' && { code: 500 },
        ...statusCode == 'ERR_NOT_FOUND' && { code: 404 },
        ...statusCode == 'SUCCESS' && { code: 200 }
    }

    res.status(statusCodeNumber.code).json({
        status: statusCode,
        code: statusCodeNumber.code,
        details
    }).end();
}

/**
 * POST & Message Payload
 */

export interface DataSetInterface {
    logLevel: LogLevelString
    logDate: date
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

type RedisCommandArgument = string | Buffer

export interface RedisArgumentInterface {
    command: string,
    id: string,
    data: number | RedisCommandArgument
}