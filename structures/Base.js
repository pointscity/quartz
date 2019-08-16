class Base {
  constructor (quartzClient) {
    this._quartz = quartzClient
  }

  get quartz () {
    return this._quartz
  }

  get client () {
    return this._quartz.client
  }

  get logger () {
    return this._quartz.logger
  }
}
module.exports = Base
