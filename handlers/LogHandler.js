const COLOR = require('chalk')

class LogHandler {
  warn (...message) {
    console.log(COLOR.yellow('[WARNING]'))
    console.warn(...message)
  }

  error (...message) {
    console.log(COLOR.red('[ERROR]'))
    console.log(...message)
    console.trace()
  }

  info (...message) {
    console.log(COLOR.hex('#7289DA')('[Points]: ') + COLOR.yellow(...message))
  }

  console (...message) {
    console.log(...message)
  }
}
module.exports = LogHandler
