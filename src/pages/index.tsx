import * as React from 'react'
import type { NextPage } from 'next'
import Head from 'next/head'
import { trpc } from '../utils/trpc'

const Home: NextPage = () => {
  const [url, setUrl] = React.useState('')

  const getAudioUrl = trpc.useQuery(['yt.getAudioUrl', { url }], { enabled: false })

  const getVideoUrl = trpc.useQuery(['yt.getVideoUrl', { url }], { enabled: false })

  const downloadOptions = {
    audio: {
      value: 'audio',
      label: 'Audio',
      fetcher: getAudioUrl,
    },
    video: {
      value: 'video',
      label: 'Video',
      fetcher: getVideoUrl,
    },
  } as const

  const [downloadType, setDownloadType] = React.useState<'audio' | 'video'>(downloadOptions.audio.value)

  const currentFetcher = downloadOptions[downloadType].fetcher

  return (
    <>
      <Head>
        <title>YouTube downloader</title>
        <meta name="description" content="Simple YouTube downloader. No ads." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="container mx-auto flex flex-col items-center h-screen p-4 pt-[25%] md:pt-[5%]">
        <h1 className="text-3xl md:text-7xl leading-normal font-bold text-gray-200 mb-8 text-center">
          <span className="text-red-700">YouTube</span> downloader
        </h1>
        <p className="text-2xl mb-2">Enter a video url</p>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://www.youtube.com/watch?..."
          name="url"
          className="bg-slate-600 px-2 py-1 rounded-md outline-none hover:outline-gray-500 w-full md:w-1/2 focus:outline-gray-500  transition-all text-lg mb-8"
        />
        <div className="flex items-center mb-4">
          {Object.keys(downloadOptions).map((key) => (
            <div className="flex items-center last:mr-0" key={key}>
              <input
                id={`radio-${key}`}
                type="radio"
                value={downloadOptions[key].value}
                name="download-type"
                checked={downloadType === key}
                disabled={currentFetcher.isFetching}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 focus:ring-2"
                onChange={(e) => {
                  setDownloadType(e.target.value as 'audio' | 'video')
                }}
              />
              <label htmlFor={`radio-${key}`} className="py-1 pl-2 pr-6 text-md text-gray-900 dark:text-gray-300">
                {downloadOptions[key].label}
              </label>
            </div>
          ))}
        </div>
        <button
          className="py-2 rounded-md px-3 text-xl bg-blue-500 flex justify-center items-center disabled:opacity-80 disabled:cursor-not-allowed"
          disabled={!url || currentFetcher.isFetching}
          onClick={() => url && currentFetcher.refetch()}>
          {currentFetcher.isFetching ? 'Searching...' : 'Search'} 🔍
        </button>
        {currentFetcher.data && (
          <div className="flex flex-col items-center mt-10">
            <p className="text-md mb-2">
              Download {downloadOptions[downloadType].value} ▶️: &nbsp;
              <a
                href={currentFetcher.data.url}
                className="text-md mb-2 text-cyan-500 underline"
                target="_blank"
                rel="noopener noreferrer">
                {currentFetcher.data.title}
              </a>
            </p>
          </div>
        )}
      </main>
    </>
  )
}

export default Home
