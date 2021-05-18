import {
  AllowedMentionsTypes,
  APIApplicationCommandGuildInteraction,
  APIApplicationCommandInteraction,
  APIApplicationCommandInteractionDataOption,
  APIApplicationCommandInteractionDataOptionWithValues,
  APIChannel,
  APIEmbed,
  APIMessage,
  APIRole,
  ApplicationCommandInteractionDataOptionSubCommand,
  ApplicationCommandInteractionDataOptionSubCommandGroup,
  ApplicationCommandOptionType,
  InteractionResponseType
} from 'discord-api-types'
import User from './User'
import { DiscordAPI } from './Client'
import Member from './Member'

const isSubCommand = (
  option: APIApplicationCommandInteractionDataOption
): option is ApplicationCommandInteractionDataOptionSubCommand => {
  return option.type === ApplicationCommandOptionType.SUB_COMMAND
}

const isSubCommandGroup = (
  option: APIApplicationCommandInteractionDataOption
): option is ApplicationCommandInteractionDataOptionSubCommandGroup => {
  return option.type === ApplicationCommandOptionType.SUB_COMMAND_GROUP
}

const isArgument = (
  option: any
): option is APIApplicationCommandInteractionDataOptionWithValues => {
  return !!option?.value
}

const isGuild = (
  interaction: APIApplicationCommandInteraction & { guild_id?: string }
): interaction is APIApplicationCommandGuildInteraction => {
  return !!interaction.guild_id
}
type CustomDataOption = {
  name: string
  type: ApplicationCommandOptionType
  value:
    | User
    | Member
    | APIRole
    | APIChannel
    | boolean
    | string
    | number
    | `${bigint}`
}

class Interaction {
  private readonly _interaction: APIApplicationCommandGuildInteraction

  constructor(interaction: APIApplicationCommandInteraction, shardID: number) {
    if (!isGuild(interaction)) throw new Error('Not a guild')
    this._interaction = interaction
    this.send = this.send.bind(this)
    this.edit = this.edit.bind(this)
    this.delete = this.delete.bind(this)
    this.getArgument = this.getArgument.bind(this)
    this.findOptions = this.findOptions.bind(this)
    this.ping = this.ping.bind(this)
  }

  private readonly findOptions = (
    options: APIApplicationCommandInteractionDataOption[],
    result: CustomDataOption[]
  ): CustomDataOption[] => {
    const nextOptions: APIApplicationCommandInteractionDataOption[] = []
    options.forEach((option) => {
      if (!isSubCommand(option) && !isSubCommandGroup(option)) {
        if (option.type === ApplicationCommandOptionType.USER) {
          const user = this._interaction.data.resolved?.users?.[option.value]
          const member =
            this._interaction.data?.resolved?.members?.[option.value]
          if (user)
            result.push({
              name: option.name,
              value: new User(user, member),
              type: ApplicationCommandOptionType.USER
            })
          return
        } else if (option.type === ApplicationCommandOptionType.ROLE) {
          const role = this._interaction.data.resolved?.roles?.[option.value]
          if (role)
            return result.push({
              name: option.name,
              value: role,
              type: ApplicationCommandOptionType.ROLE
            })
          return
        } else if (option.type === ApplicationCommandOptionType.CHANNEL) {
          const channel =
            this._interaction.data.resolved?.channels?.[option.value]
          if (channel)
            return result.push({
              name: option.name,
              value: channel,
              type: ApplicationCommandOptionType.CHANNEL
            })
          return
        } else {
          console.log(option)
          result.push({
            name: option.name,
            type: option.type,
            value: option.value
          })
          return
        }
      } else {
        if (option.options) nextOptions.push(...option.options)
      }
    })

    if (!nextOptions || nextOptions.length <= 0) return result
    return this.findOptions(nextOptions, result)
  }

  public get name() {
    return this._interaction.data.name
  }

  public get subcommands() {
    return this._interaction.data.options?.filter(
      (option) => option.type === ApplicationCommandOptionType.SUB_COMMAND
    )
  }

  public get subcommandGroups() {
    return this._interaction.data.options?.filter(
      (option) => option.type === ApplicationCommandOptionType.SUB_COMMAND_GROUP
    )
  }

  public get type() {
    return this._interaction.type
  }

  public get arguments() {
    return this.findOptions(this._interaction.data.options ?? [], [])
  }

  public getArgument<F>(name: string, defaultValue?: F): F | undefined {
    const foundArg = this.arguments.find((arg) => arg.name === name)
    if (!foundArg || !isArgument(foundArg)) return defaultValue
    return foundArg.value as any
  }

  public get member() {
    return new Member(this._interaction.member)
  }

  public get user() {
    return new User(this._interaction.member.user, this._interaction.member)
  }

  public async send({
    embeds,
    content,
    allowedMentions,
    ephemeral,
    components
  }: {
    embeds?: APIEmbed[]
    content?: string
    allowedMentions?: AllowedMentionsTypes
    ephemeral?: boolean
    components?: any[]
  }) {
    if (!embeds && !content) throw new Error('Embed or Content is required!')
    try {
      await DiscordAPI.post(
        `/interactions/${this._interaction.id}/${this._interaction.token}/callback`,
        {
          type: InteractionResponseType.ChannelMessageWithSource,
          data: {
            content: content,
            embeds: embeds,
            allowed_mentions: allowedMentions,
            flags: ephemeral ? 64 : undefined,
            components
          }
        }
      )
    } catch (error) {
      console.log(error.response.data)
    }
  }

  public async edit({
    id = '@original',
    embeds,
    content
  }: {
    id?: string
    embeds?: APIEmbed[]
    content?: string
  }) {
    if (!embeds && !content) throw new Error('Embed or Content is required!')
    return (
      await DiscordAPI.post<APIMessage>(
        `/webhooks/${this._interaction.id}/${this._interaction.token}/messages/${id}`,
        {
          content: content,
          embeds: embeds
        }
      )
    ).data
  }

  public async delete(id = '@original') {
    await DiscordAPI.delete(
      `/webhooks/${this._interaction.id}/${this._interaction.token}/messages/${id}`
    )
  }

  public async ping() {
    await DiscordAPI.post(
      `/interactions/${this._interaction.id}/${this._interaction.token}/callback`,
      {
        type: InteractionResponseType.Pong
      }
    )
  }
}

export default Interaction
