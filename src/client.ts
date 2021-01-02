import Eris from 'eris'
import CommandListener from './command/listener'
import { CommandOptions, EventOptions, ClientOptions } from './types'

class Client extends Eris.Client {
	_commands: {
		[key: string]: CommandOptions<any, any>
	} = {}

	_events: {
		[key: string]: EventOptions<any>
	} = {}
	quartzOptions: ClientOptions

	constructor(token: string, options: ClientOptions) {
		super(token, options)
		this.quartzOptions = options
	}

	command<A, T extends object = {}>(options: CommandOptions<T, A>) {
		this._commands[options.name] = options
		options.aliases?.forEach((alias) => (this._commands[alias] = options))
	}

	event<C>(options: EventOptions<C>) {
		this._events[options.name] = options
	}

	async getMember(guildID: string, userID: string) {
		const guild = this.guilds.get(guildID)
		if (!guild) throw new Error('FetchError')

		if (guild.members.has(userID)) {
			return guild.members.get(userID)
		}
		if (this.options.restMode) {
			return await guild.getRESTMember(userID)
		}
		throw new Error('restMode')
	}

	connect() {
		const commandListener = new CommandListener(this)
		this.on('messageCreate', (message) => commandListener.onMessage(message))
		return super.connect()
	}
}

export default Client
