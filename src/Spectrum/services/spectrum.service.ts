import { Broadcaster } from './broadcaster.service';
/**
 * @module Spectrum
 */ /** */

import { State } from './state.service';
import { Identify } from './../interfaces/identify.interface';
import { Service as RSI } from './../../RSI/services/rsi.service';
import { WebSocketConnection, WebSocketClient } from 'websocket';
import { RSIApiResponse } from '../../RSI/interfaces/RSIApiResponse.interface';
import { SpectrumUser } from '../components/user.component';

var wssClient = require('websocket').client;
/**
 * Main API Class for Spectrum BOT
 * Performs every spectrum user actions via wss or api calls
 * @class Spectrum
 */
export class Service {
    /** Wss Client for spectrum */
    private wss: WebSocketClient = new wssClient();
    /** Wss Connection for spectrum */
    public wssCo: WebSocketConnection;
    /** the RSI API instance */
    private rsi: RSI = RSI.getInstance();
    /** clientId used as x-tavern-id for some calls */
    private clientId;
    /** main wss endpoint */
    private spectrumUrl = "wss://spectrum-gw.robertsspaceindustries.com/";
    /** backup payload */
    private _payload: Identify;
    /** state of the system */
    private state: State;
    /** amount of reconnect tries we still have */
    private reconnectTTL: number = 10;

    /**
     * 
     */
    constructor(callback?, errorCallback?) {
        this.wss.on('connectFailed', (error) => {
            if (errorCallback) errorCallback(error);
            else this.wssConnecFailed(error);
        });

        this.wss.on('connect', (connection: WebSocketConnection) => {
            this.wssCo = connection;
            this.state.setWsConnected(this.wssCo);
            this.reconnectTTL = 10;

            // Tell the state to restore itself
            this.state.restoreWS();

            if (callback) callback(connection);
            else this.wssConnected(connection);
        });
    }

    /**
     * Main method to launch bot and connect to Spectrum. Either anonymously
     * or with crenditials if username and password are set.
     * @param username the username to launch spectrum as
     * @param password the password to launch spectrum with
     * @return a promise which is true when the connection is ready
     */
    public initSpectrum(): Promise<boolean>;
    public initSpectrum(username, password): Promise<boolean>;
    public initSpectrum(username?, password?): Promise<boolean> {
        console.log("login rsi");

        if (username && password) {
            this.rsi.setUsername(username);
            this.rsi.setPassword(password);
        }

        // Check if we're already connected
        return this.identify().then((payload: Identify) => {
            console.log(payload.member);
            if (payload.member !== null && payload.member.id) {
                console.log("init ws on cookie.");
                return this.initWs(payload);
            }

            // We're not connected, so we launch the process.
            return this.loginRsi().then((loggedIn) => {

                if (loggedIn === false) {
                    // We wanted to login and we couldn't, exit.
                    process.exit(1);
                }

                console.log("did rsi login");
                return this.identify().then((payload: Identify) => {
                    console.log("did rsi login");
                    return this.initWs(payload);
                });
            });

        });

    }

    /**
     * Used internally to trigger the ws subscribtion when we're identified to spectrum
     * @param payload the Identify packet payload
     * @return if the connection was successfull
     */
    private initWs(payload: Identify): boolean {
        console.log("Connecting to wss");
        this._payload = payload;
        this.state = new State(payload);
        return this.launchWS();
    }

    /**
     * Convenience method to launch spectrum ws
     */
    public launchWS(): boolean {
        console.log('[DEBUG] Connecting to WS');
        let t = this.wss.connect(this.spectrumUrl + "?token=" + this._payload.token, null);
        return true;
    }

    /**
     * Convenience method for initSpectrum()
     * Launch spectrum as a given user with password
     * @see initSpectrum()
     * @param username the username
     * @param password the password
     * @return a promise which is true when the connection is ready
     */
    public initAsUser(username, password): Promise<boolean> {
        return this.initSpectrum(username, password);
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
        console.log('The RSI W.S is probably down.');
        console.log('Attempting re-connection in 10 secondes ()');

        if (this.reconnectTTL > 0) {
            this.reconnectTTL--;
            setTimeout(() => this.launchWS(), 10000);
        }
        else {
            // Drop the bot
            process.exit(1);
        }
    }

    /**
     * First API Call to be made on Spectrum Launch
     * Will populate token and x-tavern-id
     * @return 
     */
    private identify(): Promise<Identify> {
        return this.rsi.post("api/spectrum/auth/identify").then((res: RSIApiResponse) => {
            let data = res.data;

            console.log("IDENTIFY OK");
            this.getTavernId(data.token);

            return data;
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

        connection.on('close', (reasonCode, description) => {
            console.log("[DEBUG] WSS seemed to have closed with error code " + reasonCode);
            console.log("[DEBUG] Desc: " + description);
            console.log("Attempting to relaunch ws");

            // Re-launch wss.
            this.launchWS();
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
     * Getter function for the current state of Spectrum
     * @return the State object
     * @property state
     */
    public getState(): State {
        return this.state;
    }

    /**
     * Calls the RSI API to search the given name and tries to come up with
     * the best match possibles.
     * _will __not__ return the BOT's own identity_
     * @param monickerOrHandle the text to search by
     * @return an array of Users sorted by best likelyhood as calculated by RSI
     */
    public LookForUserByName(monickerOrHandle: string): Promise<SpectrumUser[]> {
        return this.rsi.PostAPIAutoComplete(monickerOrHandle).then((payload: RSIApiResponse) => {
            let data = payload.data;

            var results = [];

            if (data && data.hits && data.hits.hits) {
                data.hits.hits.forEach((hit) => {
                    results.push(new SpectrumUser(hit._source));
                });
            }

            return results;
        });
    }
}