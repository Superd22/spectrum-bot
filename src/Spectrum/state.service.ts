/**
 * @module Spectrum
 */ /** */
 
import { Websocket, WebSocketConnection } from 'websocket';
import { SpectrumLobby } from './lobby.component';
import { Identify } from './identify.interface';
import { Service as RSI } from './../RSI/rsi.service';
import { Broadcaster } from './broadcaster.service';
import { Community } from './community.interface';
import { SpectrumCommunity } from './community.component';
import { MessageType } from './messageType.enum';

/**
 * @class State
 * Represents the current state of our Spectrum informations
 * watching the websocket to synchronise server-side and client-side information 
 */
export class State {
    /** the currently bookmarked channels */
    protected bookmarks;
    /** the communities we have access to */
    protected communities:SpectrumCommunity[]=[];
    /** information on the bot member */
    protected member;
    /** notifications of the bot */
    protected notifications;
    /** the list of private lobbies (i.e private messages) */
    protected private_lobbies;
    /** a role list */
    protected roles;

    /** used internally to represent what lobbies we're listening to */
    protected _SubscribedLobbies: SpectrumLobby[];
    /** used internally to store the original state of things */
    protected _originalIdentify: Identify;

    /** Our RSI API instance */
    private RSI: RSI = RSI.getInstance();
    /** Our RSI WS API instance  */
    private Broadcaster:Broadcaster;
    /** our websocket connection to spectrum*/
    private ws:WebSocketConnection;

    private _isReady(a) {};
    private _hasFailed(a) {};

    /**
     * Creates a State Object
     * @param packet the Identify packet as sent by the RSI API
     * @param ws the RSI Spectrum websocket.
     */
    constructor(packet: Identify) {
        this._originalIdentify = packet;

        this.bookmarks = packet.bookmarks;
        packet.communities.forEach( (co:Community) => {
            this.communities.push(new SpectrumCommunity(co));
        });
        this.member = packet.member;
        this.notifications = packet.notifications;
        this.private_lobbies = packet.private_lobbies;
        this.roles = packet.roles;
    }

    public whenReady():Promise<boolean> {
        return new Promise((success, fail) => {
            this._isReady = success;
            this._hasFailed = fail;
        });
   }

    public setWsConnected(ws:WebSocketConnection) {
        this.ws = ws;

        this.Broadcaster = Broadcaster.getInstance();
        this.Broadcaster.setWs(ws);

        this.ws.on('message', (message) => {
            this.handleMessages(message);
        });
    }

    /**
     * Main callback for every messages received via websocket
     * @param message the message received
     */
    private handleMessages(message) {
        if (message.type === 'utf8') {
            console.log("[STATE] Message Received: '" + message.utf8Data + "'");
        }

        let payload = JSON.parse(message.utf8Data);
        console.log(payload.type);
        if(payload["type"] == "broadcaster.ready") {
            console.log("[STATE] BROADCASTER IS READY");
            this._isReady(true);
        }
    }

    /**
     * Getter function for _SubscribedLobbies
     * @return the array of currently subscribed to lobbies
     * @property _SubscribedLobbies
     */
    public getSubscribedLobbies(): SpectrumLobby[] {
        return this._SubscribedLobbies;
    }

    /**
     * Returns every currently acessible lobbies
     * @return the array of lobbies the bot has access to
     */
    public getAccessibleLobbies(): SpectrumLobby[] {
        var lobbies = [];

        this.communities.forEach(community => {
            community.getLobbies().forEach(lob => {
                lobbies.push(lob);
            });
        });

        return lobbies;
    }

    /**
     * Returns a community the bot can see by name
     * CASE INSENSITIVE
     * @param name the name the category
     * @return Community if found, null otherwise.
     */
    public getCommunityByName(name:string):SpectrumCommunity {
        let n = name.toLowerCase();
        return this.communities.find( (co:SpectrumCommunity) => {
            return co.getRaw().name.toLowerCase() == n;
        }) || null;
    }

    public getCommunities():SpectrumCommunity[] {
        return this.communities;
    }


}