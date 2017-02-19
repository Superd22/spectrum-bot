import { RSI } from './../RSI/rsi.service';
import { Websocket, WebSocketClient } from 'websocket';

var wssClient = require('websocket').client;
/**
 * Main API Class for Spectrum BOT
 * Performs every spectrum user actions via wss or api calls
 * @class Spectrum
 */
export class Spectrum {
    /** Wss Client for spectrum */
    private wss: WebSocketClient = new wssClient();
    /** Wss Connection for spectrum */
    private wssCo: Websocket;
    /** the RSI API instance */
    private rsi: RSI = new RSI();
    /** clientId used as x-tavern-id for some calls */
    private clientId;
    /** main wss endpoint */
    private spectrumUrl = "wss://spectrum-gw.robertsspaceindustries.com/";

    /**
     * 
     */
    constructor(callback?, errorCallback?) {
        this.wss.on('connectFailed', (error) => {
            if(errorCallback) errorCallback(error);
            else this.wssConnecFailed(error);
        });

        this.wss.on('connect', (connection) => {
            this.wssCo = connection;
            if(callback) callback(connection);
            else this.wssConnected(connection);
        });
    }

    /**
     * Main method to launch bot and connect to Spectrum. Either anonymously
     * or with crenditials if username and password are set.
     * @param username the username to launch spectrum as
     * @param password the password to launch spectrum with
     */
    public initSpectrum();
    public initSpectrum(username,password);
    public initSpectrum(username?,password?) {
        console.log("login rsi");

        if(username && password) {
            this.rsi.setUsername(username);
            this.rsi.setPassword(password);
        }

        this.loginRsi().then((loggedIn) => {
            this.identify().then((token) => {
                this.wss.connect(this.spectrumUrl + "?token=" + token, null);
            });
        });
    }

    /**
     * Launch spectrum as a given user with password
     * @param username the username
     * @param password the password
     */
    public initAsUser(username, password) {
        this.initSpectrum()
    }

    /**
     * Ensures the RSI Login is sucesfull 
     * @todo actually do it.
     */
    private loginRsi() {
        return this.rsi.login();
    }

    /**
     * Default ErrorCallback for wss
     * @param error the wss connectFailed error
     */
    private wssConnecFailed(error) {
        console.log('Connect Error: ' + error.toString());
    }

    /**
     * First API Call to be made on Spectrum Launch
     * Will populate token and x-tavern-id
     */
    private identify() {
        return this.rsi.post("api/spectrum/auth/identify").then(res => {
            let data = res.body.data;
            this.getTavernId(data.token);
            return data.token;
        });
    }

    /**
     * Default Callback on sucessfull wss Connection
     * @param connection the wss connection object
     * @todo handle messages
     */
    private wssConnected(connection) {
        console.log('WebSocket Client Connected');

        connection.on('error', function (error) {
            console.log("Connection Error: " + error.toString());
        });
        connection.on('close', function () {
            console.log('echo-protocol Connection Closed');
        });
        connection.on('message', function (message) {
            if (message.type === 'utf8') {
                console.log("Received: '" + message.utf8Data + "'");
            }
        });
    }

    /**
     * Decodes the wss token and decypher the x-tavern-id
     * @param token the token returned by the identify call
     */
    private getTavernId(token) {
        /** The middle part of the token contains a payload in base64 
         *  containing current client info, namely the client_id which is required 
         *  as x-tavern-id for any api call  */
        if (token) {
            var parts = token.split(".");
            var decoded = new Buffer(parts[1], 'base64').toString();

            var payload = JSON.parse(decoded);
            this.clientId = payload.client_id;

            this.rsi.setTavernId(this.clientId);
        }
    }

    /**
     * Subscribe wss to a given channel
     * @param channelLongName the long id of the channel
     * @todo handle return
     */
    public subscribeToChannel(channelLongName) {
        if (this.wssCo && this.wssCo.connected) {
            this.wssCo.send({
                subscription_keys: [channelLongName],
                subscription_scope: "update",
                type: "subscribe"
            });
        }
    }

    /**
     * Sends a plain unstyled text message to a chat lobby
     * @param text the content of the message
     * @param lobbyId the short ID of the lobby
     * @todo Figure out content_state 
     * @todo return state
     */
    public sendPlainMessageToLobby(text, lobbyId) {
        let m = {
            content_state: {
                blocks: [
                    {
                        data: {},
                        depth: 0,
                        entityRanges: [],
                        inlineStyleRanges: [],
                        // I typed this at random... oops
                        key: "dgmak",
                        text: text,
                        type: "unstyled"
                    }
                ],
                entityMap: {},
            },
            highlight_role_id: null,
            lobby_id: lobbyId,
            media_id: null,
            plaintext: text,
        };

        this.rsi.post("api/spectrum/message/create", m).then(res => console.log(res.body.data));
    }




}