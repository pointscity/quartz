import { Client, ClientOptions } from 'eris'
import Group from './Group'
import {
  GatewayInteractionCreateDispatchData,
  APIApplicationCommandInteractionDataOption,
  InteractionType,
  ApplicationCommandOptionType,
  APIApplicationCommandInteractionDataOptionWithValues,
  ApplicationCommandInteractionDataOptionSubCommandGroup,
  APIApplicationCommand
} from 'discord-api-types'
import axios from 'axios'
import Interaction from './Interaction'

export const DiscordAPI = axios.create({
  baseURL: 'https://discord.com/api/v9',
  headers: {
    'Content-Type': 'application/json'
  }
})

export interface Command<T> {
  name: string
  arguments?: {
    name: string
    type: ApplicationCommandOptionType
  }[]
  onRun: (interaction: Interaction, extensions: T) => Promise<void> | void
}

class PointsClient<E> extends Client {
  private groups: Record<string, Group<E>> = {}
  private commands: Record<string, Command<E>> = {}
  private extensions?: E
  globalCommands?: APIApplicationCommand[]
  private isCommand = (
    option?: APIApplicationCommandInteractionDataOption
  ): option is APIApplicationCommandInteractionDataOptionWithValues => {
    return option?.type === ApplicationCommandOptionType.SUB_COMMAND
  }

  private isSubCommandGroup = (
    command?: APIApplicationCommandInteractionDataOption
  ): command is ApplicationCommandInteractionDataOptionSubCommandGroup => {
    return command?.type === ApplicationCommandOptionType.SUB_COMMAND_GROUP
  }

  constructor(token: string, options?: ClientOptions) {
    super(token, options)

    this.on('rawWS', async (packet, id) => {
      if (packet.op !== 0 || packet.t !== 'INTERACTION_CREATE') return
      const interaction = new Interaction(
        packet.d as GatewayInteractionCreateDispatchData,
        id
      )
      switch (interaction.type) {
        case InteractionType.Ping: {
          await interaction.ping()
        }
        case InteractionType.ApplicationCommand: {
          if (!interaction.member) return
          const availableExtensions =
            typeof this.extensions === 'object'
              ? Object.entries(this.extensions)
              : []

          const extensionResults =
            (await Promise.all(
              availableExtensions.map(async ([name, onRun]) => {
                const result = await onRun(interaction)
                return [name, result]
              })
            )) ?? []

          const extensions = extensionResults.reduce<Record<string, any>>(
            function (result, item) {
              const key = item[0]
              if (typeof key !== 'string') return result
              return {
                ...result,
                key: item[1]
              }
            },
            {}
          )

          if (!!this.groups[interaction.name]) {
            const group = this.groups[interaction.name]
            const commandOptions =
              interaction.subcommands?.find(
                (cmd) => !!group.commands[cmd.name]
              ) ??
              interaction.subcommandGroups?.find((g) => !!group.groups[g.name])

            if (
              this.isCommand(commandOptions) &&
              group.commands[commandOptions.name]
            ) {
              await group.runCommand({
                name: commandOptions.name,
                interaction,
                extensions: extensions as E
              })
              return
            } else if (
              this.isSubCommandGroup(commandOptions) &&
              group.groups[commandOptions.name]
            ) {
              const subcommandGroup = group.groups[commandOptions.name]
              const subcommandOptions = commandOptions.options.find(
                (cmd) => !!subcommandGroup.commands[cmd.name]
              )
              if (!subcommandOptions) return
              await subcommandGroup.runCommand({
                name: subcommandOptions.name,
                interaction,
                extensions: extensions as E
              })
              return
            } else {
              return
            }
          } else if (!!this.commands[interaction.name]) {
            if (!interaction.member) return
            // @ts-ignore
            await this.commands[interaction.name].onRun(interaction, extensions)
          } else {
            return
          }
        }
      }
    })
  }

  public command(command: Command<E>) {
    this.commands[command.name] = command
  }

  public group({ name }: { name: string }) {
    const group = new Group<E>(name)
    this.groups[name] = group
    return group
  }

  public extension<T>({
    name,
    onRun
  }: {
    name: string
    onRun: (interaction: Interaction) => T
  }) {
    if (!this.extensions) return
    // @ts-ignore
    this.extensions[name] = onRun
  }

  public async connect(): Promise<void> {
    const { data: commands } = await DiscordAPI.get<APIApplicationCommand[]>(
      `/applications/${process.env.APP_ID}/commands`,
      {
        headers: {
          Authorization: `Bot ${process.env.TOKEN}`
        }
      }
    )
    this.globalCommands = commands
    return super.connect()
  }
}

export default PointsClient
