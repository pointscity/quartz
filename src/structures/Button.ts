export enum ButtonStyle {
  PRIMARY = 1,
  SECONDARY = 2,
  SUCCESS = 3,
  DANGER = 4,
  LINK = 5
}

class Button {
  type = 2
  style?: ButtonStyle
  label?: string
  emoji?: {
    id?: string
    name?: string
    animated?: boolean
  }
  custom_id?: string
  url?: string
  disabled?: boolean

  constructor(data = {}) {
    Object.assign(this, data)
    return this
  }

  setStyle(style: ButtonStyle): this {
    this.style = style
    return this
  }

  setLabel(label: string): this {
    this.label = label
    return this
  }

  setDisabled(disabled: boolean): this {
    this.disabled = disabled
    return this
  }

  setURL(url: string): this {
    this.url = url
    return this
  }

  setID(id: string): this {
    this.custom_id = id
    return this
  }
}

export default Button
