import { createRouter } from './context'
import { z } from 'zod'
import ytSearch from 'yt-search'
import youtubedl from 'youtube-dl-exec'
import _ from 'lodash'
import axios from 'axios'
import { endpoints } from '~/utils/constants'
import { logger } from '~/utils/logger'
import { TRPCError } from '@trpc/server'
import { cache } from '~/utils/cache'

export interface YoutubeIdResponse {
  kind: string
  etag: string
  nextPageToken: string
  regionCode: string
  pageInfo: {
    totalResults: number
    resultsPerPage: number
  }
  items?: {
    kind: string
    etag: string
    id: {
      kind: string
      videoId: string
    }
  }[]
}

export const youtubeRouter = createRouter()
  .query('getVideoIds', {
    meta: { openapi: { enabled: true, method: 'GET', path: '/getVideoIds' } },
    input: z.object({
      query: z.string(),
      limit: z.string().default('3'),
    }),
    output: z.array(z.string()),
    async resolve({ input }): Promise<string[]> {
      try {
        const { data } = await axios.get<YoutubeIdResponse>(endpoints.yt(input.query, Number(input.limit)))

        return _.map(data.items, 'id.videoId')
      } catch (error) {
        return new Promise((resolve, reject) => {
          ytSearch({ query: input.query }, (err, results) => {
            if (err) reject(err)

            const { videos } = results

            if (_.isEmpty(videos)) {
              resolve([])
            }

            videos.length = input.limit

            resolve(_.map(videos, 'videoId'))
          })
        })
      }
    },
  })
  .query('getAudioUrl', {
    input: z.object({
      url: z.string(),
    }),
    output: z.object({
      title: z.string(),
      url: z.string(),
    }),
    async resolve({ input }) {
      logger.info(`getting audio url from: ${input.url}`)

      try {
        const key = `getAudioUrl-${input.url}`

        const cachedResult = await cache.get(key)

        if (cachedResult) {
          logger.info(`got audio url from cache`)

          return cachedResult as { title: string; url: string }
        }

        const response = (await youtubedl(input.url, {
          format: 'bestaudio',
          geoBypass: true,
          getUrl: true,
          getTitle: true,
        })) as unknown as string

        const [title = '', url] = _.split(response, 'https://')

        const result = { title, url: `https://${url}` }

        await cache.set(key, result, 60 * 60)

        return result
      } catch (error) {
        logger.error(error)

        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `No results found for url '${input.url}'`,
        })
      }
    },
  })
  .query('getVideoUrl', {
    input: z.object({
      url: z.string(),
    }),
    output: z.object({
      title: z.string(),
      url: z.string(),
    }),
    async resolve({ input }) {
      try {
        logger.info(`getting video url from: ${input.url}`)

        const key = `getVideoUrl-${input.url}`

        const cachedResult = await cache.get(key)

        if (cachedResult) {
          logger.info(`got audio url from cache`)

          return cachedResult as { title: string; url: string }
        }

        const response = (await youtubedl(input.url, {
          format: 'best',
          geoBypass: true,
          getUrl: true,
          getTitle: true,
        })) as unknown as string

        const [title = '', url] = _.split(response, 'https://')

        const result = { title, url: `https://${url}` }

        await cache.set(key, result, 60 * 60)

        return result
      } catch (error) {
        logger.error(error)

        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `No results found for url '${input.url}'`,
        })
      }
    },
  })
