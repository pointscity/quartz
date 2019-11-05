const LogHandler = require('./handlers/LogHandler')
const EventEmitter = require('eventemitter3')
const EventHandler = require('./handlers/EventHandler')
const CommandHandler = require('./handlers/CommandHandler')
const Embed = require('./structures/Embed')
const QuartzError = require('./util/QuartzError')

/** QuartzClient Class */
class QuartzClient extends EventEmitter {
  /**
   * Create the QuartzClient
   * @param {object} options - QuartzClient options
   * @param {object} eris - Eris options
   */
  constructor (options = {}, eris) {
    super()
    this._client = eris
    this.owner = options.owner
    this.logger = new LogHandler()
    this.eventHandler = new EventHandler(this, options.eventHandler)
    this.commandHandler = new CommandHandler(this, options.commandHandler)
    this._client.embed = () => new Embed()
    this._client.commandHandler = this.commandHandler
    this._client.eventHandler = this.eventHandler
    this._client.logger = this.logger
  }

  /**
   * Get the eris client object
   * @return {object} The eris client object.
   */
  get client () {
    return this._client
  }

  /**
   * Start the bot
   */
  async start () {
    // Load events using eventHandler
    await this.eventHandler.loadEvents()
    // Load commands using commandHandler
    await this.commandHandler.loadCommands()
    // Connect to discord using eris client
    this._client.connect().catch(error => {
      throw new QuartzError('CLIENT_FAILED_TO_START', error)
    })
    // Bind messageCreate to commandHandler
    this._client.on('messageCreate', this.commandHandler._onMessageCreate.bind(this.commandHandler))
  }
}
module.exports = QuartzClient
