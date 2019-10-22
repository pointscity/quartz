const QuartzError = require('../util/QuartzError')
const Base = require('./Base')

class Command extends Base {
  constructor (client, options = {}) {
    super(client, { module: options.module })
    const {
      name = '',
      aliases = [],
      channel = null,
      ownerOnly = false,
      guildOnly = true,
      devOnly = false,
      premium = '',
      description = '',
      cooldown = {
        expires: 5000,
        command: 2
      },
      userPermissions = this.userPermissions
    } = options

    this.name = name
    this.aliases = aliases
    this.channel = channel
    this.ownerOnly = Boolean(ownerOnly)
    this.guildOnly = Boolean(guildOnly)
    this.devOnly = Boolean(devOnly)
    this.premium = premium
    this.description = description
    this.cooldown = cooldown
    this.userPermissions = typeof userPermissions === 'function' ? userPermissions.bind(this) : userPermissions
    this._client = client
  }

  get client () {
    return this._client
  }

  run () {
    throw new QuartzError('NOT_IMPLEMENTED', this.constructor.name, 'run')
  }
}
module.exports = Command
