import Eris from 'eris';
import { CommandOptions, EventOptions, ClientOptions } from './types';
declare class Client extends Eris.Client {
    _commands: {
        [key: string]: CommandOptions<any, any>;
    };
    _events: {
        [key: string]: EventOptions<any>;
    };
    quartzOptions: ClientOptions;
    constructor(token: string, options: ClientOptions);
    command<A, T extends object = {}>(options: CommandOptions<T, A>): void;
    event<C>(options: EventOptions<C>): void;
    getMember(guildID: string, userID: string): Promise<Eris.Member | undefined>;
    connect(): Promise<void>;
}
export default Client;
