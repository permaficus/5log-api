import {
    RabbitMQ,
    DEFAULT_5LOG_EXCHANGE,
    DEFAULT_5LOG_ROUTING_KEY,
    DEFAULT_5LOG_QUEUE,
    MESSAGE_BROKER_SERVICE
} from "@/libs/amqplibs.utils";
import * as dataHandler from "@/v1/worker/requestHandler";
import chalk from 'chalk'

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
                /** deconstructing message payload */
                const { task, origin, payload } = JSON.parse(msg.content);
                try {
                    // start processing incomming message
                    
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
