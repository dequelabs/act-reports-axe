declare module "static-server" {
  export default class StaticServer {
    constructor(options: {
      rootPath?: string
      port?: string
    })
    start(callback: (val: unknown) => void): void
    stop(): void
  }
}
