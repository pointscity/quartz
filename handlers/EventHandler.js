const QuartzError = require('../util/QuartzError')
const { sep, resolve } = require('path')
const { readdirSync } = require('fs')
const { Collection } = require('eris')
const quartzEvents = ['missingPermission', 'commandRun']

class EventHandler {
  constructor (quartz, options = {}) {
    this._quartz = quartz
    this.directory = options.directory
    this.debug = options.debug
    this.events = new Collection()
  }

  get quartz () {
    return this._quartz
  }

  get client () {
    return this._quartz.client
  }

  async loadEvents () {
    const files = await readdirSync(this.directory).filter(f => f.endsWith('.js'))
    if (files.length <= 0) throw new QuartzError('NO_FILES_IN_FOLDER', this.directory)
    await files.forEach(file => {
      const Event = require(resolve(`${this.directory}${sep}${file}`))
      const evt = new Event(this.client)
      if (!evt) throw new QuartzError('EVT_FILE_EMPTY', `${this.directory}${sep}${file}`)
      if (!evt.name) throw new QuartzError('EVT_MISSING_NAME', `${this.directory}${sep}${file}`)
      if (this.events.get(evt.name)) throw new QuartzError('EVT_ALREADY_EXISTS', evt.name)
      this.events.set(evt.name, evt)
      if (this.debug) this.quartz.logger.info(`Loading event ${evt.name}`)
      if (quartzEvents.includes(evt.name)) this.quartz.on(evt.name, evt.run.bind(this))
      else if (evt.name === 'messageCreate') this.client.on(evt.name, this._onMessageCreate.bind(this))
      else this.client.on(evt.name, evt.run.bind(this))
    })
  }

  async _onMessageCreate (msg) {
    if (!msg.author || msg.author.bot) return
    msg.command = false
    const prefix = await this.client.commandHandler.prefix(msg)
    const escapeRegex = str => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const content = msg.content.toLowerCase()
    if (Array.isArray(prefix)) {
      prefix.forEach(p => escapeRegex(p))
      const prefixRegex = new RegExp(`^(<@!?${this.client.user.id}>|${prefix.join('|')})\\s*`)
      const matchedPrefix = prefixRegex.test(content) && content.match(prefixRegex) ? content.match(prefixRegex)[0] : undefined
      if (matchedPrefix) msg.prefix = matchedPrefix
    } else {
      const content = msg.content.toLowerCase()
      const prefixRegex = new RegExp(`^(<@!?${this.client.user.id}>|${escapeRegex(prefix.toLowerCase())})\\s*`)
      const matchedPrefix = prefixRegex.test(content) && content.match(prefixRegex) ? content.match(prefixRegex)[0] : undefined
      if (matchedPrefix) msg.prefix = matchedPrefix
    }
    msg.content = msg.content.replace(/<@!/g, '<@')
    if (msg.prefix) {
      const args = msg.content.substring(msg.prefix.length).split(' ')
      const label = args.shift().toLowerCase()
      const command = await this.client.commandHandler.getCommand(label)
      if (command) msg.command = command
    }
    const event = this.events.get('messageCreate')
    return event.run.call(this, msg)
  }
}
module.exports = EventHandler
