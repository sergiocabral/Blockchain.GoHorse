import './Helper/Prototype/Date';
import './Helper/Prototype/List';
import './Helper/Prototype/Number';
import './Helper/Prototype/String';
import environment from './env.json';
import {CoinChatBotApp} from './App/CoinChatBot/CoinChatBotApp';
import {ChatWatcherApp} from "./App/ChatWatcher/ChatWatcherApp";
import {InvalidExecutionError} from "./Errors/InvalidExecutionError";

const applicationName: string = process.argv[2];

switch (applicationName) {
    case 'coinChatBot': new CoinChatBotApp(environment).run(); break;
    case 'chatWatcher': new ChatWatcherApp(environment).run(); break;
    default: throw new InvalidExecutionError('Nothing application was informed.');
}
