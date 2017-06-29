# Spectrum bot
Is a crude NodeJs api to do stuff with Star Citizen's Spectrum (v0.3.5u)

## Docs
You can find the Documentation in the `Docs/` folder or at https://superd22.github.io/spectrum-bot/

## Example
```typescript

var bot = new Spectrum();

// Init the bot as user (you need to declare a config)
bot.initAsUser(config.username, config.password).then( (isConnected) => {
    let state = bot.getState();

    // Wait for internal state to be ready
    state.whenReady().then(() => {

        // Get a community
        let global = state.getCommunityByName("Star Citizen");
        // Get a lobby in that community
        let testLobby = global.getLobbyByName("general");

        // Get events from Lobby
        testLobby.subscribe();
        // Send a nice text
        testLobby.sendPlainTextMessage("Hello this is a test !");

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
```

## How to use for your own bots
1. `npm install --save spectrum-bot@Superd22/spectrum-bot` to install the latest version of the api
2. `import { Spectrum } from "spectrum-bot"` for typescript or `const Spectrum = require("spectrum-bot");` for ES5
3. Follow sample code to start building your own bot

## How to dev
Dependencies : nodejs.
1. Clone/download the repo 
2. run `npm install` to download/install dependencies.
    - depending on your setup, you might need to install globally ts-node & typescript `npm install -g ts-node typescript`
3. create app/config.ts using the config.sample.ts template with the desired account
4. (create an empty bot/cache/cookie.json)
5. run `ts-node app/bot.ts` or its alias `npm start`to run the provided sample bot. 


## What's implemented
- Send a text message to text lobby (emoji + mention support)
- Send an embed (video/link/image) text message to lobby
- Get Lobby
- Get User
- Get Community
- Subscribe to a lobby to see whats happening there
- declare custom callbacks for WS events
