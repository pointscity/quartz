import { Command } from './Client'
import Interaction from './Interaction'

class Group {
  name: string
  onButtonClick?: (interaction: Interaction<any>) => Promise<void> | void
  private _groups: Record<string, Group> = {}
  private _commands: Record<string, Command<any>> = {}

  constructor(
    name: string,
    onButtonClick?: (interaction: Interaction<any>) => Promise<void> | void
  ) {
    this.name = name
    this.onButtonClick = onButtonClick
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
