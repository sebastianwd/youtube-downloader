export const endpoints = {
  yt: (query: string, limit: number) =>
    `https://www.googleapis.com/youtube/v3/search?part=Id&maxResults=${limit}&order=relevance&key=${process.env.YOUTUBE_API_KEY}&type=video&q=${query}`,
}
