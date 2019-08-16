const LogHandler = require('./handlers/LogHandler')
const EventEmitter = require('eventemitter3')
const EventHandler = require('./handlers/EventHandler')
const CommandHandler = require('./handlers/CommandHandler')
const Embed = require('./structures/Embed')

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
  }

  get client () {
    return this._client
  }

  async start () {
    await this.logger.info('Loading...')
    await this.eventHandler.loadEvents()
    await this.commandHandler.loadCommands()
    this._client.connect().then(async () => {
      this.logger.info('=== PointsClient Connected! ===')
    })
    this._client.once('ready', this._onReady.bind(this))
    this._client.on('messageCreate', this.commandHandler._onMessageCreate.bind(this.commandHandler))
  }

  async _onReady () {
    this.logger.info('=== PointsClient Ready! ===')
  }
}
module.exports = QuartzClient
