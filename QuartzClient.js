const LogHandler = require('./handlers/LogHandler')
const EventEmitter = require('eventemitter3')
const EventHandler = require('./handlers/EventHandler')
const CommandHandler = require('./handlers/CommandHandler')
const Embed = require('./structures/Embed')
const QuartzError = require('./util/QuartzError')

class QuartzClient extends EventEmitter {
  constructor (options = {}, eris) {
    super()
    this._client = eris
    this.owner = options.owner
    this.logger = LogHandler
    this.eventHandler = new EventHandler(this, options.eventHandler)
    this.commandHandler = new CommandHandler(this, options.commandHandler)
    this._client.embed = () => new Embed()
    this._client.commandHandler = this.commandHandler
    this._client.eventHandler = this.eventHandler
    this._client.logger = this.logger
  }

  get client () {
    return this._client
  }

  async start () {
    await this.eventHandler.loadEvents()
    await this.commandHandler.loadCommands()
    this._client.connect().catch(error => {
      throw new QuartzError('CLIENT_FAILED_TO_START', error)
    })
    this._client.on('messageCreate', this.commandHandler._onMessageCreate.bind(this.commandHandler))
  }
}
module.exports = QuartzClient
