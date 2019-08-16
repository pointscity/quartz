const Messages = {
  ALIAS_CONFLICT: (alias, name) => `Alias '${alias}' of '${name}' already exists`,
  CMD_ALREADY_EXISTS: cmdname => `Command '${cmdname}' already exists`,
  CMD_FILE_EMPTY: filename => `Command '${filename}' file is empty`,
  CMD_MISSING_NAME: filename => `Command '${filename}' is missing a name`,
  EVT_ALREADY_EXISTS: evtname => `Event '${evtname}' already exists`,
  EVT_FILE_EMPTY: filename => `Event '${filename}' file is empty`,
  EVT_MISSING_NAME: filename => `Event '${filename}' is missing a name`,
  NO_FILES_IN_FOLDER: dirname => `No files found in folder '${dirname}'`,
  FOLDER_NOT_FOUND: dirname => `No folder found in '${dirname}'`,
  FILE_NOT_FOUND: filename => `File '${filename}' not found`,
  MODULE_NOT_FOUND: (constructor, id) => `${constructor} '${id}' does not exist`,
  NOT_IMPLEMENTED: (constructor, method) => `${constructor}#${method} has not been implemented`,
  UNKNOWN: error => error,
  INVALID_CLASS_TO_HANDLE: (given, expected) => `Class to handle ${given} is not a subclass of ${expected}`
}

class QuartzError extends Error {
  constructor (key, ...args) {
    if (Messages[key] == null) throw new TypeError(`Error key '${key}' does not exist`)
    const message = typeof Messages[key] === 'function'
      ? Messages[key](...args)
      : Messages[key]

    super(message)
    this.code = key
  }

  get name () {
    return `PointsError [${this.code}]`
  }
}

module.exports = QuartzError
