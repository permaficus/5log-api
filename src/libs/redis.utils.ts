import redis from 'redis'
import { REDIS_URL } from '@/constant/global.config'
import { RedisArgumentInterface } from '@/modules'

export const redisClient = async () => {
    const client = redis.createClient({
        url: REDIS_URL
    })
    await client.connect()
    client.on('error', err => {
        console.log(`[REDIS] ${err.message} : ${err.code}`);
    });
    client.on('reconnecting', ()=> console.log(`[REDIS] reconnecting to ${REDIS_URL}`))
    client.on('ready', ()=> console.log(`[REDIS] Connected`))
    return client
}
export const redisCache = async ({command, id, data}: RedisArgumentInterface): Promise<string | undefined | null> => {
    const client = await redisClient();
    switch (command) {
        case 'set': {
            await client.set(id, data, { NX: true, EX: 1800 })
            break
        }
        case 'get': {
            const result = await client.get(id)
            return result
        }
    }
}