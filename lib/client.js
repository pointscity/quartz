"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const eris_1 = __importDefault(require("eris"));
const listener_1 = __importDefault(require("./command/listener"));
class Client extends eris_1.default.Client {
    constructor(token, options) {
        super(token, options);
        this._commands = {};
        this._events = {};
        this.quartzOptions = options;
    }
    command(options) {
        var _a;
        this._commands[options.name] = options;
        (_a = options.aliases) === null || _a === void 0 ? void 0 : _a.forEach((alias) => (this._commands[alias] = options));
    }
    event(options) {
        this._events[options.name] = options;
    }
    async getMember(guildID, userID) {
        const guild = this.guilds.get(guildID);
        if (!guild)
            throw new Error('FetchError');
        if (guild.members.has(userID)) {
            return guild.members.get(userID);
        }
        if (this.options.restMode) {
            return await guild.getRESTMember(userID);
        }
        throw new Error('restMode');
    }
    connect() {
        const commandListener = new listener_1.default(this);
        this.on('messageCreate', (message) => commandListener.onMessage(message));
        return super.connect();
    }
}
exports.default = Client;
//# sourceMappingURL=client.js.map