import { config } from './config';
import { Spectrum } from '../src/';
import { SpectrumUser } from '../src/Spectrum/components/shared/user.component';

var bot = new Spectrum();

// Init the bot as user (you need to declare a config)
bot.initAsUser(config.username, config.password).then( (isConnected) => {
    let state = bot.getState();

    // Wait for internal state to be ready
    state.whenReady().then(() => {

        // Get a community
        let global = state.getCommunityByName("Sibylla");
        // Get a lobby in that community
        let testLobby = global.getLobbyByName("test");

        // Get events from Lobby
        testLobby.subscribe();
        // Send a nice text
        testLobby.sendPlainTextMessage("**Hello** *this* is a `test` ! :flag-fr: ");

        // Look for an user
        bot.LookForUserByName("UserNameOrHandle").then((users:SpectrumUser[]) => {
            let user = users[0];

            if(user)
            // Get a private Lobby with the user
            user.getPrivateLobbyWithUser().then((pmLobby) => {
                // subscribe to messages there
                pmLobby.subscribe();

                // Wait till we get a message from that user
                user.onMessage((message) => {
                    // Answer back !
                    pmLobby.sendPlainTextMessage("I got your text !");
                });
            });

        });
    });
    
});