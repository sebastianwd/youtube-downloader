import pino, { LoggerOptions } from 'pino'

const options: LoggerOptions =
  process.env.NODE_ENV === 'development'
    ? {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
          },
        },
      }
    : {}

export const logger = pino(options)
