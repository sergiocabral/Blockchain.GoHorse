import {MainApp} from './Core/MainApp';
import environment from './env.json';
import './Helper/Prototype/String';
import './Helper/Prototype/List';

new MainApp(environment).run();
