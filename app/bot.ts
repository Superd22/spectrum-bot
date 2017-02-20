import { config } from './config';
import { Spectrum } from '..';

var bot = new Spectrum();

// Init the bot as user (you need to declare a config)
bot.initAsUser(config.username, config.password).then( (isConnected) => {
    let state = bot.getState();

    // Wait for internal state to be ready
    state.whenReady().then(() => {

        // Get a community
        let global = state.getCommunityByName("Star Citizen");
        // Get a lobby in that community
        let testLobby = global.getLobbyByName("fr");

        // Do stuff !
        testLobby.subscribe();
        // testLobby.sendPlainTextMessage("Coucou à tous !");
    });
    
});
