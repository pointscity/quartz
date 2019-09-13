const QuartzError = require('../util/QuartzError')
const Base = require('./Base')

class Event extends Base {
  constructor (client, options = {}) {
    super(client, { module: options.module })
    const {
      name = ''
    } = options

    this.name = name
    this._client = client
  }

  get client () {
    return this._client
  }

  run () {
    throw new QuartzError('NOT_IMPLEMENTED', this.constructor.name, 'run')
  }
}
module.exports = Event
