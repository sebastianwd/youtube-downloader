import NodeCache from 'node-cache'

class Cache {
  cache: NodeCache
  constructor() {
    const cacheOptions: NodeCache.Options = {
      stdTTL: 60, // keys live for 60 seconds
      useClones: true,
    }

    this.cache = new NodeCache(cacheOptions)
  }

  async get<T>(key: string) {
    const value = await this.cache.get<T>(key)

    return value
  }

  async set<T>(key: string, value: T, ttl?: string | number) {
    return this.cache.set<T>(key, value, ttl!)
  }

  async has(key: string) {
    return this.cache.has(key)
  }
}

export const cache = new Cache()
