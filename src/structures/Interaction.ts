import {
  AllowedMentionsTypes,
  APIApplicationCommandGuildInteraction,
  APIApplicationCommandInteraction,
  APIApplicationCommandInteractionDataOption,
  APIEmbed,
  APIMessage,
  APIRole,
  APIApplicationCommandInteractionDataSubcommandOption,
  APIApplicationCommandInteractionDataSubcommandGroupOption,
  ApplicationCommandOptionType,
  InteractionResponseType,
  APIInteractionDataResolvedChannel,
  APIGuildInteraction
} from 'discord-api-types/v10'
import User from './User'
import Member from './Member'
import { FastifyReply, FastifyRequest } from 'fastify'
import ActionRow from './ActionRow'
import { DiscordAPI } from '..'

const isSubCommand = (
  option: APIApplicationCommandInteractionDataOption
): option is APIApplicationCommandInteractionDataSubcommandOption => {
  return option.type === ApplicationCommandOptionType.Subcommand
}

const isSubCommandGroup = (
  option: APIApplicationCommandInteractionDataOption
): option is APIApplicationCommandInteractionDataSubcommandGroupOption => {
  return option.type === ApplicationCommandOptionType.SubcommandGroup
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
    | APIInteractionDataResolvedChannel
    | boolean
    | string
    | number
    | `${bigint}`
}

class Interaction<A> {
  private readonly _interaction: APIGuildInteraction
  _req: FastifyRequest
  _res: FastifyReply
  constructor(req: FastifyRequest, res: FastifyReply) {
    const body = req.body as APIApplicationCommandInteraction
    if (!isGuild(body)) throw new Error('Not a guild')
    this._req = req
    this._res = res
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
        if (option.type === ApplicationCommandOptionType.User) {
          if (
            !('resolved' in this._interaction.data) ||
            !this._interaction.data.resolved
          )
            return
          if (!('users' in this._interaction.data.resolved)) return
          const user = this._interaction.data.resolved?.users?.[option.value]
          const member =
            this._interaction.data?.resolved?.members?.[option.value]
          if (user)
            result.push({
              name: option.name,
              value: new User(user, member),
              type: ApplicationCommandOptionType.User
            })
          return
        } else if (option.type === ApplicationCommandOptionType.Role) {
          if (
            !('resolved' in this._interaction.data) ||
            !this._interaction.data.resolved
          )
            return
          if (!('roles' in this._interaction.data.resolved)) return
          const role = this._interaction.data.resolved?.roles?.[option.value]
          if (role)
            return result.push({
              name: option.name,
              value: role,
              type: ApplicationCommandOptionType.Role
            })
          return
        } else if (option.type === ApplicationCommandOptionType.Channel) {
          if (
            !('resolved' in this._interaction.data) ||
            !this._interaction.data.resolved
          )
            return
          if (!('channels' in this._interaction.data.resolved)) return
          const channel =
            this._interaction.data.resolved?.channels?.[option.value]
          if (channel)
            return result.push({
              name: option.name,
              value: channel,
              type: ApplicationCommandOptionType.Channel
            })
          return
        } else if (option.type === ApplicationCommandOptionType.Mentionable) {
          if (
            !('resolved' in this._interaction.data) ||
            !this._interaction.data.resolved
          )
            return
          if (!('users' in this._interaction.data.resolved)) return
          const user = this._interaction.data.resolved?.users?.[option.value]
          if (user) {
            const member =
              this._interaction.data?.resolved?.members?.[option.value]
            result.push({
              name: option.name,
              value: new User(user, member),
              type: ApplicationCommandOptionType.Mentionable
            })
          } else {
            if (!('roles' in this._interaction.data.resolved)) return
            const role = this._interaction.data.resolved?.roles?.[option.value]
            if (role)
              return result.push({
                name: option.name,
                value: role,
                type: ApplicationCommandOptionType.Mentionable
              })
            return
          }
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
    return 'name' in this._interaction.data
      ? this._interaction.data.name
      : undefined
  }

  public get subcommands() {
    if (!('options' in this._interaction.data)) return undefined
    return this._interaction.data.options?.filter(
      (option) => option.type === ApplicationCommandOptionType.Subcommand
    )
  }

  public get subcommandGroups() {
    if (!('options' in this._interaction.data)) return undefined
    return this._interaction.data.options?.filter(
      (option) => option.type === ApplicationCommandOptionType.SubcommandGroup
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
    if (!('options' in this._interaction.data)) return {} as A
    const args = this.findOptions(this._interaction.data.options ?? [], [])
    return args.reduce<any>(function (result, item) {
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
    components?: ActionRow[]
    defer?: boolean
  }) {
    if (!embeds && !content) throw new Error('Embed or Content is required!')
    return this._res.status(200).send({
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

  public async followup({
    embeds,
    content,
    ephemeral,
    allowedMentions
  }: {
    embeds?: APIEmbed[]
    content?: string
    ephemeral?: boolean
    allowedMentions?: AllowedMentionsTypes
  }) {
    if (!embeds && !content) throw new Error('Embed or Content is required!')
    await DiscordAPI.post(
      `/webhooks/${this._interaction.id}/${this._interaction.token}`,
      {
        content,
        embeds,
        allowed_mentions: allowedMentions,
        flags: ephemeral ? 64 : undefined
      }
    )
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
      await DiscordAPI.patch<APIMessage>(
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
    return this._res.status(200).send({
      type: InteractionResponseType.Pong
    })
  }

  public async update({
    embeds,
    content,
    allowedMentions,

    components
  }: {
    embeds?: APIEmbed[]
    content?: string
    allowedMentions?: AllowedMentionsTypes
    components?: ActionRow[]
  }) {
    return this._res.status(200).send({
      type: 7,
      data: {
        content,
        embeds,
        allowed_mentions: allowedMentions,
        components
      }
    })
  }
}

export default Interaction
