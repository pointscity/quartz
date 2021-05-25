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
import { FastifyReply, FastifyRequest } from 'fastify'

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

class Interaction<A> {
  private readonly _interaction: APIApplicationCommandGuildInteraction
  #req: FastifyRequest
  #res: FastifyReply
  constructor(req: FastifyRequest, res: FastifyReply) {
    const body = req.body as APIApplicationCommandInteraction
    if (!isGuild(body)) throw new Error('Not a guild')
    this.#req = req
    this.#res = res
    this._interaction = body
    this.send = this.send.bind(this)
    this.edit = this.edit.bind(this)
    this.delete = this.delete.bind(this)
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

  public get guildID() {
    return this._interaction.guild_id
  }

  public get channelID() {
    return this._interaction.channel_id
  }

  public get type() {
    return this._interaction.type
  }

  public get args(): A {
    const args = this.findOptions(this._interaction.data.options ?? [], [])
    return args.reduce<any>(function(result, item, index) {
      result[item.name] = item.value
      return result
    }, {})
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
    components,
    defer
  }: {
    embeds?: APIEmbed[]
    content?: string
    allowedMentions?: AllowedMentionsTypes
    ephemeral?: boolean
    components?: any[]
    defer?: boolean
  }) {
    if (!embeds && !content) throw new Error('Embed or Content is required!')
    return this.#res.status(200).send({
      type: defer
        ? InteractionResponseType.DeferredChannelMessageWithSource
        : InteractionResponseType.ChannelMessageWithSource,
      data: {
        content,
        embeds,
        allowed_mentions: allowedMentions,
        flags: ephemeral ? 64 : undefined,
        components
      }
    })
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
    return this.#res.status(200).send({
      type: InteractionResponseType.Pong
    })
  }
}

export default Interaction
