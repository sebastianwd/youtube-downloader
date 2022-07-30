// src/server/router/index.ts
import { createRouter } from './context'
import superjson from 'superjson'

import { youtubeRouter } from './yt-router'
import { generateOpenApiDocument } from 'trpc-openapi'
import { getBaseUrl } from '~/utils/get-base-url'

export const appRouter = createRouter().transformer(superjson).merge('yt.', youtubeRouter)

// export type definition of API
export type AppRouter = typeof appRouter

export const openApiDocument = generateOpenApiDocument(appRouter, {
  title: 'tRPC OpenAPI',
  version: '1.0.0',
  baseUrl: getBaseUrl(),
})
