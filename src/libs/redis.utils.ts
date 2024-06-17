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
            await client.set(id, data, { NX: true, EX: 1800 })
            break
        }
        case 'get': {
            const result = await client.get(id)
            return result
        }
    }
}
export const idCompiler = ({ baseId, params, query }: {
    baseId: string | string[] | undefined, 
    params: any, 
    query: {[key: string]: string | string [] | any}
}): string => {
    let objectId = baseId
    objectId = objectId + `${params.logsid ? `:${params.logsid}`:``}`;
    objectId = objectId + `${query?.logtype ? `:${query?.logtype}`:``}`;
    objectId = objectId + `${query?.take ? `:${query?.take}`:``}`;
    return objectId
}