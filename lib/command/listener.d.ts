import Eris, { Permission } from 'eris';
import Client from '../client';
import { Args, ArgType, CommandOptions } from '../types';
declare class CommandListener {
    client: Client;
    constructor(client: Client);
    verifyArgs(types: Args, args: string[], message: Eris.Message): Promise<ArgType[]>;
    checkPermissions({ command, message, channelPermissions }: {
        command: CommandOptions<any, any>;
        message: Eris.Message;
        channelPermissions: Permission;
    }): Promise<boolean>;
    onMessage(message: Eris.Message): Promise<Eris.Message<Eris.TextableChannel> | undefined>;
}
export default CommandListener;
