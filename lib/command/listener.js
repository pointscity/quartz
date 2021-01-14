"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const eris_1 = __importDefault(require("eris"));
const split_string_1 = __importDefault(require("split-string"));
class CommandListener {
    constructor(client) {
        this.client = client;
    }
    async verifyArgs(types, args, message) {
        const min = types.filter((arg) => !arg.optional && !arg.default).length;
        if (!(min <= args.length && args.length <= types.length))
            throw new Error('MismatchedArgs');
        return Promise.all(types.map(async (arg, index) => {
            var _a, _b, _c, _d;
            const type = arg.type;
            const value = args[index];
            if (value === undefined) {
                if (arg.default) {
                    return typeof arg.default === 'function'
                        ? arg.default(message)
                        : arg.default;
                }
                else if (arg.optional) {
                    return undefined;
                }
                else {
                    throw new Error('MismatchedArgType');
                }
            }
            switch (type) {
                case Number: {
                    if (!Number(value))
                        throw new Error('MismatchedArgType');
                    return Number(value);
                }
                case Boolean: {
                    if (!(value.toLowerCase() === 'false' ||
                        value.toLowerCase() === 'true'))
                        throw new Error('MismatchedArgType');
                    return value.toLowerCase() === 'false' ? false : true;
                }
                case eris_1.default.Member: {
                    if ((message.channel.type !== 0 && message.channel.type !== 5) ||
                        !message.guildID)
                        throw new Error('');
                    const id = (_a = value.match(/^<@!*(\d)+>$/g)) !== null && _a !== void 0 ? _a : value.match(/^\d+$/g);
                    if (id) {
                        return this.client.getMember(message.guildID, id[0]);
                    }
                    const tag = value.match(/^(.+)#(\d\d\d\d)$/);
                    if (tag) {
                        const member = message.channel.guild.members.find((member) => member.username === tag[0] && member.discriminator === tag[1]);
                        if (member)
                            return member;
                    }
                    await message.channel.createMessage({
                        embed: {
                            description: '**Beep Boop,** unable to match the arguments, this argument accepts a mention, id, or `username#discriminator`.'
                        }
                    });
                    break;
                }
                case eris_1.default.User: {
                    const id = (_b = value.match(/^<@!*(\d)+>$/g)) !== null && _b !== void 0 ? _b : value.match(/^\d+$/g);
                    if (id) {
                        if (this.client.users.has(id[0])) {
                            return this.client.users.get(id[0]);
                        }
                        if (this.client.options.restMode) {
                            return await this.client.getRESTUser(id[0]);
                        }
                        else {
                            return await message.channel.createMessage({
                                embed: {
                                    description: '**Beep Boop,** the developer forgot to set `restMode` to true in eris options.'
                                }
                            });
                        }
                    }
                    const tag = value.match(/^(.+)#(\d\d\d\d)$/);
                    if (tag) {
                        const user = this.client.users.find((user) => user.username === tag[0] && user.discriminator === tag[1]);
                        if (user)
                            return user;
                    }
                    throw new Error('MismatchedArgType');
                }
                case eris_1.default.TextChannel: {
                    if (message.channel.type !== 0 && message.channel.type !== 5)
                        throw new Error('');
                    const id = (_c = value.match(/^<#(\d)+>$/g)) !== null && _c !== void 0 ? _c : value.match(/^\d+$/g);
                    if (id) {
                        if (message.channel.guild.channels.has(id[0])) {
                            return message.channel.guild.channels.get(id[0]);
                        }
                        throw new Error('Something went wrong... Discord prob fucked caching up again');
                    }
                    await message.channel.createMessage({
                        embed: {
                            description: '**Beep Boop,** unable to match the arguments, this argument accepts a mention or id.'
                        }
                    });
                    break;
                }
                case eris_1.default.Message: {
                    const id = value.match(/^\d+$/g);
                    if (id) {
                        if (message.channel.messages.has(id[0]))
                            return message.channel.messages.get(id[0]);
                        else {
                            return await message.channel.getMessage(id[0]);
                        }
                    }
                    await message.channel.createMessage({
                        embed: {
                            description: '**Beep Boop,** unable to match the arguments, this argument accepts an id.'
                        }
                    });
                    break;
                }
                case eris_1.default.Role: {
                    if (message.channel.type !== 0 && message.channel.type !== 5)
                        throw new Error('');
                    const id = (_d = value.match(/^<@&(\d)+>$/g)) !== null && _d !== void 0 ? _d : value.match(/^\d+$/g);
                    if (id) {
                        if (message.channel.guild.roles.has(id[0])) {
                            return message.channel.guild.roles.get(id[0]);
                        }
                        throw new Error('Something went wrong... Discord prob fucked caching up again');
                    }
                    await message.channel.createMessage({
                        embed: {
                            description: '**Beep Boop,** unable to match the arguments, this argument accepts an id.'
                        }
                    });
                }
                case String: {
                    return value;
                }
                default:
                    await message.channel.createMessage({
                        embed: {
                            description: '**Beep Boop,** unable to match the argument type. This is a developer misconfiguration.'
                        }
                    });
            }
        }));
    }
    async checkPermissions({ command, message, channelPermissions }) {
        var _a, _b;
        if ((_a = command.permissions) === null || _a === void 0 ? void 0 : _a.bot) {
            if (Array.isArray(command.permissions.bot) &&
                (message.channel.type === 0 || message.channel.type === 5)) {
                try {
                    const bot = message.channel.guild.members.has(this.client.user.id)
                        ? message.channel.guild.members.get(this.client.user.id)
                        : await message.channel.guild.getRESTMember(this.client.user.id);
                    if (!bot)
                        return false;
                    const hasPermission = command.permissions.bot.some((permission) => bot.permissions.has(permission) ||
                        channelPermissions.has(permission));
                    if (!hasPermission) {
                        return false;
                    }
                }
                catch (_c) {
                    throw new Error('Unable to fetch bot member for permissions');
                }
            }
        }
        if ((_b = command.permissions) === null || _b === void 0 ? void 0 : _b.user) {
            if (Array.isArray(command.permissions.user) &&
                (message.channel.type === 0 || message.channel.type === 5)) {
                try {
                    const user = message.member
                        ? message.member
                        : await message.channel.guild.getRESTMember(message.author.id);
                    if (!user)
                        return false;
                    const hasPermission = command.permissions.user.some((permission) => user.permissions.has(permission) ||
                        channelPermissions.has(permission));
                    if (!hasPermission) {
                        return false;
                    }
                }
                catch (_d) {
                    throw new Error('Unable to fetch member for permissions');
                }
            }
            else if (typeof command.permissions.user === 'function' &&
                (await command.permissions.user(message)) !== true)
                return false;
        }
        return true;
    }
    async onMessage(message) {
        var _a;
        if (message.author.bot)
            return;
        const prefix = typeof this.client.quartzOptions.prefix === 'function'
            ? await this.client.quartzOptions.prefix(message)
            : this.client.quartzOptions.prefix;
        if (!message.content.startsWith(prefix))
            return;
        message.prefix = prefix;
        const content = message.content
            .substring(this.client.quartzOptions.prefix.length)
            .trim();
        const rawArgs = split_string_1.default(content, {
            separator: ' ',
            keep: (value, state) => value !== '\\' &&
                ((value !== '"' && value !== '“' && value !== '”') ||
                    state.prev() === '\\')
        });
        const label = rawArgs[0];
        const command = this.client._commands[label];
        if (!(command && ((_a = command.channel) === null || _a === void 0 ? void 0 : _a.includes(message.channel.type))))
            return;
        if (message.channel.type === 0 || message.channel.type === 5) {
            const channelPermissions = message.channel.permissionsOf(this.client.user.id);
            if (!channelPermissions.has('sendMessages'))
                return;
            if (!channelPermissions.has('embedLinks'))
                return await message.channel.createMessage(`${message.author.mention}, \`Embed Links\` is required for the bot to work!`);
            if (!(await this.checkPermissions({
                message,
                command,
                channelPermissions
            })))
                return;
        }
        if (command.beforeRun) {
            command.run(Object.assign(Object.assign({}, (await command.beforeRun({ message }))), { message, args: command.args
                    ? await this.verifyArgs(command.args, rawArgs.slice(1), message)
                    : rawArgs.slice(1) }));
        }
        else {
            command.run({
                message,
                args: command.args
                    ? await this.verifyArgs(command.args, rawArgs.slice(1), message)
                    : rawArgs.slice(1)
            });
        }
    }
}
exports.default = CommandListener;
//# sourceMappingURL=listener.js.map