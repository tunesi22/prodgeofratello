import Redis from 'ioredis'

let redis: Redis

export async function connectRedis(): Promise<Redis> {
  const url = process.env.REDIS_URL || 'redis://localhost:6379'

  redis = new Redis(url, {
    maxRetriesPerRequest: null,
  })

  await new Promise<void>((resolve, reject) => {
    redis.once('ready', () => {
      console.log('[REDIS] Connected')
      resolve()
    })
    redis.once('error', (err) => {
      console.error('[REDIS] Connection failed:', err)
      reject(err)
    })
  })

  return redis
}

export function getRedis(): Redis {
  if (!redis) throw new Error('[REDIS] Not connected yet')
  return redis
}
