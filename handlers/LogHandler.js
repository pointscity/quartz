const COLOR = require('chalk')

/** LogHandler Class */
class LogHandler {
  /**
   * Send warning to console
   * @param {string} message - The warning message
   */
  warn (...message) {
    console.log(COLOR.yellow('[WARNING]'))
    console.warn(...message)
  }

  /**
   * Send error to console
   * @param {string} message - The error message
   */
  error (...message) {
    console.log(COLOR.red('[ERROR]'))
    console.log(...message)
    console.trace()
  }

  /**
   * Send info to console
   * @param {string} message - The info message
   */
  info (...message) {
    console.log(COLOR.hex('#7289DA')('[Points]: ') + COLOR.yellow(...message))
  }

  /**
   * Send console to console
   * @param {string} message - The console message
   */
  console (...message) {
    console.log(...message)
  }
}
module.exports = LogHandler
