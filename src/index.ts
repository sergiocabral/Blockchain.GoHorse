import './Helper/Prototype/String';
import './Helper/Prototype/List';
import environment from './env.json';
import {CoinChatBotApp} from './Core/CoinChatBotApp';
import {ChatWatcherApp} from "./Core/ChatWatcherApp";
import {InvalidExecutionError} from "./Errors/InvalidExecutionError";

const applicationName: string = process.argv[2];

switch (applicationName) {
    case 'coinChatBot': new CoinChatBotApp(environment).run(); break;
    case 'chatWatcher': new ChatWatcherApp(environment).run(); break;
    default: throw new InvalidExecutionError('Nothing application was informed.');
}
