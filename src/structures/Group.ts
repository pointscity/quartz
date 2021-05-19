import { Command } from './Client'
import Interaction from './Interaction'

class Group<E> {
  name: string
  private _groups: Record<string, Group<E>> = {}
  private _commands: Record<string, Command<E>> = {}

  constructor(name: string) {
    this.name = name
  }

  get groups(): Record<string, Group<E>> {
    return this._groups
  }

  get commands(): Record<string, Command<E>> {
    return this._commands
  }

  public command(command: Command<E>) {
    this._commands[command.name] = command
  }

  public async runCommand({
    name,
    interaction,
    extensions
  }: {
    name: string
    interaction: Interaction
    extensions: E
  }) {
    const command = this.commands[name]
    if (!command || !interaction.member) return
    await command.onRun(interaction, extensions)
  }

  public group({ name }: { name: string }) {
    const group = new Group<E>(name)
    this._groups[name] = group
    return group
  }
}

export default Group
