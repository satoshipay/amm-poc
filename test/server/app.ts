import Koa from "koa"
import CORS from "kcors"
import url from "url"

import { Config } from "./config"
import createRouter from "./router"

const ErrorMiddleware = () => async (ctx: Koa.Context, next: () => Promise<any>) => {
  try {
    return await next()
  } catch (error) {
    if (error.status && error.status >= 400 && error.status < 500) {
      const body: any = {
        message: error && error.message ? error.message : "Unknown error",
      }
      for (const prop of ["data", "response"]) {
        if (prop in error) {
          body[prop] = error[prop]
        }
      }
      ctx.response.body = body
      ctx.response.status = error.status
    } else {
      // re-throw
      throw error
    }
  }
}

export default function createApp(config: Config) {
  const app = new Koa()
  const router = createRouter(config)
  const pathPrefix = url.parse(config.baseUrl).pathname as string

  router.prefix(pathPrefix)

  return app.use(CORS()).use(ErrorMiddleware()).use(router.routes()).use(router.allowedMethods())
}
