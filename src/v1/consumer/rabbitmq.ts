import {
    RabbitMQ,
    DEFAULT_5LOG_EXCHANGE,
    DEFAULT_5LOG_ROUTING_KEY,
    DEFAULT_5LOG_REPLY_QUEUE,
    DEFAULT_5LOG_REPLY_ROUTE,
    DEFAULT_5LOG_QUEUE,
    MESSAGE_BROKER_SERVICE
} from "@/libs/amqplibs.utils";
import { MessagePayload } from "@/modules/main";
import { processingData } from "@/v1/worker/requestHandler";
import chalk from 'chalk'
import { validateIncommingMessage } from "../middlewares/requestValidators";
import { publishMessage } from "../responder/amqp";

export const consumerInit = async () => {
    const rbmq = RabbitMQ();
    rbmq.connect();
    rbmq.on('connected', async (EventListener) => {
        const { channel, conn } = EventListener;
        const exchange = await rbmq.initiateExchange({
            name: null, 
            type: 'direct',
            durable: true,
            autoDelete: false,
            internal: false,
            channel: channel
        });
        await rbmq.createQueue({
            channel: channel,
            name: DEFAULT_5LOG_QUEUE,
            options: {
                durable: true,
                arguments: { 
                    'x-queue-type': 'classic',
                    "x-dead-letter-exchange": exchange
                }
            }
        });
        await channel.bindQueue(DEFAULT_5LOG_QUEUE, exchange, DEFAULT_5LOG_ROUTING_KEY)
        await channel.consume(DEFAULT_5LOG_QUEUE, async (msg: any) => {
            if (msg) {
                /**
                 * TODO!
                 * * We need a token or reference ID to prevent duplicate payloads from being 
                 * * stored in case of a connection failure on RabbitMQ.
                 */
                let hasError = false;
                /** deconstructing message payload */
                const { task, origin, payload }: MessagePayload = JSON.parse(msg.content);
                /**
                 * Validating incomming message
                 */
                await validateIncommingMessage({task, origin, payload}, async (error: any) => {
                    if (error) {
                        await publishMessage({
                            queue: origin.queue || DEFAULT_5LOG_REPLY_QUEUE,
                            routingKey: origin.routingKey || DEFAULT_5LOG_REPLY_ROUTE,
                            message: JSON.parse(error)
                        })
                        channel.ack(msg);
                        hasError = true;
                    };
                });

                if (hasError) return;

                try {
                    // start processing incomming message
                    await processingData({
                        protocol: 'amqp',
                        method: task,
                        body: payload,
                        origin
                    })
                    channel.ack(msg)
                } catch (error: any) {
                    const errObject = JSON.parse(error.message)
                    if (errObject.status && errObject.code) {
                        channel.ack(msg)
                    } else {
                        channel.nack(msg, true, true)
                    }
                }
            }
        });
        process.once('SIGINT' || 'exit' || 'SIGKILL', async () => {
            rbmq.setClosingState(true);
            await channel.close();
            await conn.close();
            process.exit(1)
        })
    
        console.log(`-----------------------------------------
            \n${chalk.black.bgGreenBright(`🚀 Ready for incomming messages\n`
            )}\nRabbitMQ: ${chalk.blueBright(
            `${MESSAGE_BROKER_SERVICE.split('@')[1]}`
            )}\nExchange: ${chalk.blueBright(
                `${DEFAULT_5LOG_EXCHANGE}`
            )}\nTime: ${chalk.blueBright(
                `${new Date(Date.now())}`
            )}\n\n-----------------------------------------`
        );
    });
    rbmq.on('error', error => {
        console.log(error)
        console.info(chalk.red(`[RABBIT-MQ] Error: ${error.message}`))
    })
    rbmq.on('reconnect', attempt => {
        console.info(`[RABBIT-MQ] Retrying connect to: ${chalk.yellow(MESSAGE_BROKER_SERVICE.split('@')[1])}, attempt: ${chalk.green(attempt)}`)
    })
    rbmq.on('ECONNREFUSED', () => {
        console.error(chalk.red(`[RABBIT-MQ] Connection to ${MESSAGE_BROKER_SERVICE.split('@')[1]} refused`));
        return;
    })
}
