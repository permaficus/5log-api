import {
    RabbitMQ,
    DEFAULT_5LOG_REPLY_QUEUE,
    DEFAULT_5LOG_REPLY_ROUTE,
    MESSAGE_BROKER_SERVICE
} from "@/libs/amqplibs.utils";
import { MessageOrigin } from "@/modules/main";
import chalk from 'chalk'

export const publishMessage = async (options: MessageOrigin) => {
    const rbmq =  RabbitMQ();
    rbmq.connect();
    rbmq.on('connected', async (EventListener) => {
        const { channel, conn } = EventListener;
        const targetQueue = options.queue || DEFAULT_5LOG_REPLY_QUEUE;
        const targetRoutingKey = options.routingKey || DEFAULT_5LOG_REPLY_ROUTE;
        const exchange = await rbmq.initiateExchange({
            name: null, 
            type: 'direct',
            durable: true,
            autoDelete: false,
            internal: false,
            channel: channel
        });
        rbmq.createQueue({
            name: targetQueue,
            channel: channel,
            options: {
                durable: true,
                arguments: { 'x-queue-type': 'classic' }
            }
        });
        await channel.bindQueue(targetQueue, exchange, targetRoutingKey)
        await channel.publish(exchange, targetRoutingKey, Buffer.from(JSON.stringify(options.message)))
        rbmq.setClosingState(true)
        await channel.close();
        await conn.close();
    })
    rbmq.on('error', error => {
        console.info(chalk.red(`[RBMQ] Error: ${error.message}`))
    })
    rbmq.on('reconnect', attempt => {
        console.info(`[RBMQ] Retrying connect to: ${chalk.yellow(MESSAGE_BROKER_SERVICE.split('@')[1])}, attempt: ${chalk.green(attempt)}`)
    })
    rbmq.on('ECONNREFUSED', () => {
        console.error(chalk.red(`[RBMQ] Connection to ${MESSAGE_BROKER_SERVICE.split('@')[1]} refused`))
        return;
    })
}