class Embed {
  fields: {
    name: string
    value: string
    inline?: boolean
  }[]
  url?: string
  author?: {
    name: string
    icon_url?: string
    url?: string
  }

  color?: number
  description?: string
  file?: string

  footer?: {
    text: string
    icon_url: string
  }

  image?: {
    url: string
  }

  date?: Date
  title?: string
  thumbnail?: {
    url: string
  }

  constructor(data = {}) {
    this.fields = []
    Object.assign(this, data)
    return this
  }

  setAuthor(name: string, icon?: string, url?: string): this {
    this.author = { name, icon_url: icon, url }
    return this
  }

  setColor(color: string | number) {
    if (typeof color === 'string') color = parseInt(color.replace('#', ''), 16)
    if (color < 0 || color > 0xffffff)
      throw new RangeError('Color range is invaild.')
    else if (isNaN(color)) throw new TypeError('Unable to convert color.')
    this.color = color
    return this
  }

  setDescription(desc: string): this {
    this.description = desc.toString().substring(0, 2048)
    return this
  }

  addField(name: string, value: string, inline: boolean = false): this {
    if (this.fields.length >= 25) return this
    else if (name === '') throw new TypeError('Missing name field.')
    else if (value === '') throw new TypeError('Missing value field.')
    this.fields.push({
      name: name.toString().substring(0, 256),
      value: value.toString().substring(0, 1024),
      inline
    })
    return this
  }

  setFile(file: string): this {
    this.file = file
    return this
  }

  setFooter(text: string, icon: string): this {
    this.footer = {
      text: text.toString().substring(0, 2048),
      icon_url: icon
    }
    return this
  }
  setImage(url: string): this {
    this.image = { url }
    return this
  }

  setTimestamp(time = new Date()): this {
    this.date = time
    return this
  }

  setTitle(title: string): this {
    this.title = title.toString().substring(0, 256)
    return this
  }

  setThumbnail(url: string): this {
    this.thumbnail = { url }
    return this
  }

  setURL(url: string): this {
    this.url = url
    return this
  }
}

export default Embed
