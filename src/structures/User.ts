import {
  APIGuildMember,
  APIUser,
  UserFlags,
  UserPremiumType
} from 'discord-api-types'

export default class User implements APIUser {
  id: `${bigint}`
  username: string
  discriminator: string
  avatar_hash: string | null
  bot?: boolean | undefined
  system?: boolean | undefined
  mfa_enabled?: boolean | undefined
  locale?: string | undefined
  verified?: boolean | undefined
  email?: string | null | undefined
  flags?: UserFlags | undefined
  premium_type?: UserPremiumType | undefined
  public_flags?: UserFlags | undefined
  member?: Omit<APIGuildMember, 'user' | 'deaf' | 'mute'> & {
    permissions: `${bigint}`
  }

  constructor(
    user: APIUser,
    member?: Omit<APIGuildMember, 'user' | 'deaf' | 'mute'> & {
      permissions: `${bigint}`
    }
  ) {
    this.id = user.id
    this.username = user.username
    this.avatar_hash = user.avatar
    this.discriminator = user.discriminator
    this.bot = user.bot
    this.system = user.system
    this.mfa_enabled = user.mfa_enabled
    this.locale = user.locale
    this.verified = user.verified
    this.email = user.email
    this.flags = user.flags
    this.premium_type = user.premium_type
    this.public_flags = user.public_flags
    this.member = member
  }

  get avatar() {
    return this.avatar_hash
      ? `https://cdn.discordapp.com/avatars/${this.id}/${this.avatar_hash}${
          this.avatar_hash?.startsWith('a_') ? '.gif' : '.png'
        }?size=24px`
      : `https://cdn.discordapp.com/embed/avatars/${
          Number(this.discriminator) % 5
        }.png`
  }

  get mention() {
    return `<@${this.id}>`
  }

  get tag() {
    return `${this.username}#${this.discriminator}`
  }
}
