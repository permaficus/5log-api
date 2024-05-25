import Joi, { ValidationError } from 'joi';

const validator = async (schema: any, payload: any) => {
    return await schema.validateAsync(payload, {
        abortEarly: true,
        allowUnknown: false
    })
};

const _template_: any = {
    logLevel: Joi.string().label('Log Level').required(),
    source: Joi.object().label('Log Source').required(),
    eventCode: Joi.string().label('Event Code').required(),
    destination: Joi.string().label('Destination field').allow('').default('N/A'),
    environment: Joi.string().label('Environment field').allow('').default('N/A').required(),
    errorDescription: Joi.string().label('Log Description').required()
}
const validateSchema = async (payload: any) => {
    let schema = Joi.object(_template_)
    return await validator(schema, payload)
}

export { validateSchema, ValidationError }