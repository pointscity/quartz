
/** Base Class */
class Base {
  /**
   * Create the eventHandler
   * @param {object} quartzClient - QuartzClient object
   */
  constructor (quartzClient) {
    this._quartz = quartzClient
  }

  /**
   * Get the quartz client object
   * @return {object} The quartz client object.
   */
  get quartz () {
    return this._quartz
  }

  /**
   * Get the eris client object
   * @return {object} The eris client object.
   */
  get client () {
    return this._quartz.client
  }

  /**
   * Get the logger object
   * @return {object} The logger object.
   */
  get logger () {
    return this._quartz.logger
  }
}
module.exports = Base
