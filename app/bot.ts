import { config } from './config';
import { Spectrum } from '..';

var bot = new Spectrum();

bot.initAsUser(config.username, config.password);
