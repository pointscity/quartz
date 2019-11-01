// MIT License
//
// Copyright (c) 2018 1Computer1
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

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
  INVALID_CLASS_TO_HANDLE: (given, expected) => `Class to handle ${given} is not a subclass of ${expected}`,
  CLIENT_FAILED_TO_START: error => error
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
    return `QuartzError [${this.code}]`
  }
}

module.exports = QuartzError
