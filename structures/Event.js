const QuartzError = require('../util/QuartzError')
const Base = require('./Base')

/** Event Class */
class Event extends Base {
  /**
   * Create the eventHandler
   * @param {object} client - Client object
   * @param {object} options - Options object
   */
  constructor (client, options = {}) {
    super(client, { module: options.module })
    const {
      name = ''
    } = options

    this.name = name
    this._client = client
  }

  /**
   * Get the eris client object
   * @return {object} The eris client object.
   */
  get client () {
    return this._client
  }

  /**
   * Run when command called
   */
  run () {
    throw new QuartzError('NOT_IMPLEMENTED', this.constructor.name, 'run')
  }
}
module.exports = Event
