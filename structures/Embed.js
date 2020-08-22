/** Embed Class */
class Embed {
  /**
   * Create the embed
   * @param {object} data - Data object
   */
  constructor (data = {}) {
    this.fields = []
    Object.assign(this, data)
    return this
  }

  /**
   * Author for the embed
   * @param {string} name - Name of user
   * @param {string} icon - Icon of user
   * @param {string} url - A url
   */
  author (name, icon, url) {
    this.author = { name, icon_url: icon, url }
    return this
  }

  /**
   * Color for the embed
   * @param {string} color - A color
   */
  color (color) {
    this.color = (color[0] === "#") ? parseInt(color.replace("#", ""), 16) : color
    return this
  }

  /**
   * Description for the embed
   * @param {string} desc - A description
   */
  description (desc) {
    this.description = desc.toString().substring(0, 2048)
    return this
  }

  /**
   * Field for the embed
   * @param {string} name - A name
   * @param {string} value - A value
   * @param {boolean} inline - A inline
   */
  field (name, value, inline = false) {
    if (this.fields.length >= 25) return this
    else if (!name) return this
    else if (!value) return false
    this.fields.push({ name: name.toString().substring(0, 256), value: value.toString().substring(0, 1024), inline })
    return this
  }

  /**
   * File for the embed
   * @param {string} file - A file
   */
  file (file) {
    this.file = file
    return this
  }

  /**
   * Footer for the embed
   * @param {string} text - A text
   * @param {string} icon - A icon
   */
  footer (text, icon) {
    this.footer = { text: text.toString().substring(0, 2048), icon_url: icon }
    return this
  }

  /**
   * Image for the embed
   * @param {string} url - A url
   */
  image (url) {
    this.image = { url }
    return this
  }

  /**
   * Timestamp for the embed
   * @param {date} time - A date
   */
  timestamp (time = new Date()) {
    this.date = time
    return this
  }

  /**
   * Title for the embed
   * @param {string} title - A title
   */
  title (title) {
    this.title = title.toString().substring(0, 256)
    return this
  }

  /**
   * Thumbnail for the embed
   * @param {string} url - A url
   */
  thumbnail (url) {
    this.thumbnail = { url }
    return this
  }

  /**
   * URL for the embed
   * @param {string} url - A url
   */
  url (url) {
    this.url = url
    return this
  }
}

module.exports = Embed
