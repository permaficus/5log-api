import Joi, { ValidationError } from 'joi';

const validator = async (schema: any, payload: any) => {
    return await schema.validateAsync(payload, {
        abortEarly: true,
        allowUnknown: false
    })
};

const _template_: any = {
    logLevel: Joi.string().label('Log Level').required(),
    logTicket: Joi.string().label('Log Ticket'),
    client_id: Joi.string().label('Client ID'),
    source: Joi.object().label('Log Source'),
    eventCode: Joi.string().label('Event Code').required(),
    destination: Joi.string().label('Destination field').allow('').default('N/A'),
    environment: Joi.string().label('Environment field').allow('').default('N/A').required(),
    errorDescription: Joi.string().label('Log Description').required()
}

const _amqptemplate_: any = {
    task: Joi.string().valid('POST', 'GET', 'DELETE').label('Task').required(),
    payload: Joi.object({..._template_}).required(),
    origin: Joi.object({
        queue: Joi.string().label('Queue Name').required(),
        routingKey: Joi.string().label('Message routing key').required(),
        message: Joi.object().label('Respond message').optional(),
        fallback: Joi.object({
            url: Joi.string().label('Fallback URL').required(),
            method: Joi.string().valid('POST').required(),
            headers: Joi.string().optional()
        }).optional()
    }).label('Origin').required().unknown(false)
}

const validateSchema = async (payload: any, protocol?: 'amqp' | 'http') => {
    let schema = protocol == 'http' ? Joi.object(_template_) : Joi.object(_amqptemplate_).fork(['payload.logTicket', 'payload.client_id'], (field) => field.required())
    return await validator(schema, payload)
}

export { validateSchema, ValidationError }