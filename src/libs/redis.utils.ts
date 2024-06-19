import { createClient} from 'redis'
import { REDIS_URL } from '@/constant/global.config'
import { RedisArgumentInterface } from '@/modules/main'

export const redisClient = async () => {
    const client = createClient({
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
            // set expiry time at 2 hours (7200 secs)
            await client.set(id, data, { NX: true, EX: 7200 })
            break
        }
        case 'get': {
            const result = await client.get(id)
            return result
        }
    }
}
export const idCompiler = ({ baseId, query, params }: {
    baseId: string | string[] | undefined, 
    query: {[key: string]: string | string [] | any},
    params?: any, 
}): string => {
    return `${baseId}${params?.logsid ? `:${params?.logsid}`:``}${query?.logtype ? `:${query?.logtype}`:``}${query?.take ? `:${query?.take}`:``}`
}