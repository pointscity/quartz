import { Events, Permissions, ChannelTypes } from './constants'
import Eris from 'eris'

export type ArgType =
	| typeof Number
	| typeof Boolean
	| typeof String
	| typeof Eris.Member
	| typeof Eris.User
	| typeof Eris.Message
	| typeof Eris.TextChannel
	| typeof Eris.Role

export interface Arg {
	type: ArgType
	optional?: boolean
	default?: string | boolean | number | ((message: Eris.Message) => any)
}

export type Args = Arg[]

export interface CommandOptions<T extends object, A> {
	name: string
	aliases?: string[]
	category: string
	description?: string
	args?: Args
	permissions?: {
		user?: (msg: Eris.Message) => boolean | Permissions[]
		bot?: Permissions[]
	}
	channel?: ChannelTypes[]
	beforeRun?: (context: { message: Eris.Message }) => T
	run: (context: { message: Eris.Message; args: A } & T) => void
}

export interface EventOptions<C> {
	name: Events
	run: (context: C) => void
}

export interface ClientOptions extends Eris.ClientOptions {
	prefix: string | ((msg: Eris.Message) => string | Promise<string>)
	owners: string[]
	cooldown?: {
		bypass?: string[]
		amount?: number
		time?: number
	}
}
