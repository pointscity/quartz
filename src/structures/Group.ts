import { Command } from './Client'
import Interaction from './Interaction'

class Group {
  name: string
  private _groups: Record<string, Group> = {}
  private _commands: Record<string, Command<any>> = {}

  constructor(name: string) {
    this.name = name
  }

  get groups(): Record<string, Group> {
    return this._groups
  }

  get commands(): Record<string, Command<any>> {
    return this._commands
  }

  public command<A>(command: Command<A>) {
    this._commands[command.name] = command
  }

  public async runCommand({
    name,
    interaction
  }: {
    name: string
    interaction: Interaction<any>
  }) {
    const command = this.commands[name]
    if (!command || !interaction.member) return
    await command.onRun(interaction)
  }

  public group({ name }: { name: string }) {
    const group = new Group(name)
    this._groups[name] = group
    return group
  }
}

export default Group
