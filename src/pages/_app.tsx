// src/pages/_app.tsx
import { withTRPC } from '@trpc/next'
import type { AppRouter } from '../server/router'
import type { AppType } from 'next/dist/shared/lib/utils'
import superjson from 'superjson'
import '../styles/globals.css'
import { getBaseUrl } from '~/utils/get-base-url'

const MyApp: AppType = ({ Component, pageProps }) => {
  return <Component {...pageProps} />
}

export default withTRPC<AppRouter>({
  config({ ctx }) {
    /**
     * If you want to use SSR, you need to use the server's full URL
     * @link https://trpc.io/docs/ssr
     */
    const url = `${getBaseUrl()}/api/trpc`

    return {
      url,
      transformer: superjson,
      /**
       * @link https://react-query.tanstack.com/reference/QueryClient
       */
      queryClientConfig: {
        defaultOptions: {
          queries: {
            refetchOnMount: false,
            refetchOnWindowFocus: true,
            refetchOnReconnect: false,
          },
        },
      },
    }
  },
  /**
   * @link https://trpc.io/docs/ssr
   */
  ssr: false,
})(MyApp)
