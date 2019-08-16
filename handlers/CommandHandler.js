const QuartzError = require('../util/QuartzError')
const Embed = require('../structures/Embed')
const { readdirSync, statSync } = require('fs')
const { join, sep, resolve } = require('path')
const { Collection } = require('eris')

class CommandHandler {
  constructor (quartz, options = {}) {
    this._quartz = quartz
    this.directory = options.directory || './commands'
    this.debug = options.debug || false
    this.prefix = options.prefix || 'p!'
    this.defaultCooldown = options.defaultCooldown || 10000
    this.commands = new Collection()
    this.modules = new Collection()
    this.aliases = new Collection()
    this._text = options.text
    this._logo = options.logo
    this._color = options.color
  }

  get quartz () {
    return this._quartz
  }

  get client () {
    return this._quartz.client
  }

  async getCommands (module) {
    const files = await readdirSync(`${this.directory}${sep}${module}`).filter(f => f.endsWith('.js'))
    if (files.length <= 0) throw new QuartzError('NO_FILES_IN_FOLDER', `${this.directory}${sep}${module}`)
    return files.map(file => {
      const commandName = file.replace(/\.[^/.]+$/, '')
      return this.getCommand(commandName)
    })
  }

  async loadModules () {
    const rd = await readdirSync(this.directory).filter(f => statSync(join(this.directory, f)).isDirectory())
    return rd
  }

  async loadCommands () {
    const modules = await this.loadModules()
    if (modules.length <= 0) throw new QuartzError('FOLDER_NOT_FOUND', this.directory)
    await modules.forEach(async module => {
      const files = await readdirSync(`${this.directory}${sep}${module}`).filter(f => f.endsWith('.js'))
      if (files.length <= 0) throw new QuartzError('NO_FILES_IN_FOLDER', `${this.directory}${sep}${module}`)
      await files.forEach(async file => {
        const Command = require(resolve(`${this.directory}${sep}${module}${sep}${file}`))
        const cmd = new Command(this.client)
        if (!cmd) throw new QuartzError('CMD_FILE_EMPTY', `${this.directory}${sep}${module}${sep}${file}`)
        if (!cmd.name) throw new QuartzError('CMD_MISSING_NAME', `${this.directory}${sep}${module}${sep}${file}`)
        if (this.commands.get(cmd.name.toLowerCase())) throw new QuartzError('CMD_ALREADY_EXISTS', cmd.name)
        await cmd.aliases.forEach(alias => {
          if (this.aliases.get(alias)) throw new QuartzError('ALIAS_CONFLICT', alias, cmd.name)
        })
        this.commands.set(cmd.name.toLowerCase(), cmd)
        this.modules.set(cmd.name, module)
        if (this.debug) this.quartz.logger.info(`Loading command ${cmd.name} from ${module}`)
        if (cmd.aliases && cmd.aliases.length > 0) await cmd.aliases.forEach(alias => this.aliases.set(alias, cmd.name))
      })
    })
  }

  async reloadCommand (commandName) {
    const cmd = this.commands.get(commandName.toLowerCase())
    if (!cmd) return undefined
    const module = this.modules.get(commandName)
    delete require.cache[require.resolve(`${this.directory}${sep}${module}${sep}${commandName}.js`)]
    cmd.aliases.forEach(alias => this.aliases.delete(alias))
    this.modules.delete(commandName)
    this.commands.delete(commandName.toLowerCase())
    const Command = require(resolve(`${this.directory}${sep}${module}${sep}${commandName}`))
    const newCmd = new Command(this.client)
    if (!newCmd) throw new QuartzError('CMD_FILE_EMPTY', `${this.directory}${sep}${module}${sep}${commandName}`)
    if (!newCmd.name) throw new QuartzError('CMD_MISSING_NAME', `${this.directory}${sep}${module}${sep}${commandName}`)
    if (this.commands.get(cmd.name.toLowerCase())) throw new QuartzError('CMD_ALREADY_EXISTS', cmd.name)
    await cmd.aliases.forEach(alias => {
      if (this.aliases.get(alias)) throw new QuartzError('ALIAS_CONFLICT', alias, cmd.name)
    })
    this.commands.set(cmd.name.toLowerCase(), cmd)
    this.modules.set(cmd.name, module)
    if (this.debug) this.quartz.logger.info(`Loading command ${cmd.name} from ${module}`)
    if (cmd.aliases && cmd.aliases.length > 0) await cmd.aliases.forEach(alias => this.aliases.set(alias, cmd.name))
  }

  getCommand (commandName) {
    if (!commandName) return undefined
    let cmd = this.commands.get(commandName)
    if (!cmd) {
      const alias = this.aliases.get(commandName)
      if (!alias) return null
      cmd = this.commands.get(alias)
    }
    return cmd
  }

  async text (msg) {
    if (typeof this.text !== 'function') return this._text
    else return this._text(msg)
  }

  async logo (msg) {
    if (typeof this.logo !== 'function') return this._logo
    else return this._logo(msg)
  }

  async color (msg) {
    if (typeof this.color !== 'function') return this._color
    else return this._color(msg)
  }

  async embed (message, options = {}) {
    const embed = new Embed()
    if (options.reply && !options.bold) embed.description(`<@${this.data.author.id}>, ${message}`)
    else if (options.bold && !options.reply) embed.description(`**${message}**`)
    else if (options.bold && options.reply) embed.description(`**<@${this.data.author.id}>, ${message}**`)
    else embed.description(message)
    if (options.premium) embed.color(this.client.config.embed.premium.color)
    else if (options.color) embed.color(options.color)
    else embed.color(await this.color())
    if (options.footer) embed.footer(await this.text(), await this.logo())
    return this.msg.channel.createMessage({ embed: embed })
  }

  async _onMessageCreate (msg) {
    if (!msg.author || msg.author.bot) return
    if (!msg.channel.guild) return
    msg.command = false
    const getPrefix = await this.client.prefix.get(msg.channel.guild.id)
    const lowerCaseMessage = msg.content.toLowerCase()
    if (!lowerCaseMessage.startsWith(getPrefix.toLowerCase() || this.prefix.toLowerCase())) return
    msg.content = msg.content.replace(/<@!/g, '<@')
    msg.prefix = getPrefix.toLowerCase() || this.prefix.toLowerCase()
    const args = msg.content.substring(msg.prefix.length).split(' ')
    const label = args.shift().toLowerCase()
    const command = await this.getCommand(label)
    if (!command) return
    msg.command = command
    msg.embed = this.embed.bind(msg)
    msg.color = this.color.bind(this, msg)
    msg.logo = this.logo.bind(this, msg)
    msg.text = this.text.bind(this, msg)
    if (command.guildOnly && !msg.channel.guild) return
    if (msg.channel.guild) msg.guild = msg.channnl.guild
    if (command.ownerOnly && msg.author.id !== this.client.config.ownerID) return
    if (process.env.NODE_ENV !== 'development' && command.devOnly && msg.author.id !== this.client.config.ownerID) return this.client.embeds.embed(msg, `<@${msg.author.id}>, **Currently Unavailable:** The bot is currently unavailable.`)
    if (command.userPermissions) {
      if (typeof command.userPermissions === 'function') {
        let missing = await command.userPermissions(msg)
        if (missing != null) {
          this.quartz.emit('missingPermission', { msg, command, missing })
          return
        }
      } else if (msg.channel.guild) {
        let perm = msg.member.permission.has(command.userPermissions)
        if (!perm) {
          this.quartz.emit('missingPermission', { msg, command, missing: command.userPermissions })
          return
        }
      }
    }
    await command.run(msg, args)
      .then(() => {
        this.quartz.emit('commandRun', { msg, command })
      })
      .catch(error => {
        console.log(error)
        throw new QuartzError('UNKNOWN', error)
      })
  }
}
module.exports = CommandHandler
