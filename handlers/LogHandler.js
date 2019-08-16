const COLOR = require('chalk')

exports.warn = (...message) => {
  console.log(COLOR.yellow('[WARNING]'))
  console.warn(...message)
  console.log(COLOR.yellow('[/WARNING]'))
}

exports.error = (...message) => {
  console.log(COLOR.red('[ERROR]'))
  console.log(...message)
  console.trace()
  console.log(COLOR.red('[/ERROR]'))
}

exports.fatal = (...message) => {
  console.log(COLOR.red('[ERROR]'))
  console.log(...message)
  console.log(COLOR.red('[/ERROR]'))
}

exports.info = (...message) => {
  console.log(COLOR.hex('#7289DA')('[Points]: ') + COLOR.yellow(...message))
}

exports.message = message => {
  console.log(COLOR.hex('#7289DA')('[Points]: ') + message)
}

exports.console = (...message) => {
  console.log(...message)
}
