import Button from './Button'

class ActionRow {
  type = 1
  components: Button[] = []

  constructor(data = {}) {
    Object.assign(this, data)
    return this
  }

  addButton(button: Button): this {
    this.components.push(button)
    return this
  }
}

export default ActionRow
