import { APIInteractionGuildMember } from 'discord-api-types/v10'

class Member {
  #member: APIInteractionGuildMember
  constructor(member: APIInteractionGuildMember) {
    this.#member = member
  }

  get id() {
    return this.#member.user?.id
  }

  get roles() {
    return this.#member.roles
  }

  hasPermission(permission: bigint) {
    return !!(BigInt(this.#member.permissions) & permission)
  }

  hasRoles(roles: string[]) {
    return this.#member.roles.find((role) => roles.includes(role))
  }
}

export default Member
