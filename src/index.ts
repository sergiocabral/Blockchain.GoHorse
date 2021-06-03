import {CoinChatBotApp} from './Core/CoinChatBotApp';
import environment from './env.json';
import './Helper/Prototype/String';
import './Helper/Prototype/List';

new CoinChatBotApp(environment).run();
