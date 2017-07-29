import { ISpectrumUser } from './../interfaces/user.interface';
import { ReplaySubject } from 'rxjs';
/**
 * @module Spectrum
 */ /** */

import { Websocket, WebSocketConnection } from 'websocket';
import { SpectrumLobby } from './../components/lobby.component';
import { ISpectrumIdentifyPacket } from './../interfaces/identify.interface';
import { Service as RSI } from './../../RSI/services/rsi.service';
import { SpectrumBroadcaster } from './broadcaster.service';
import { ISpectrumCommunity } from './../interfaces/community.interface';
import { SpectrumCommunity } from './../components/community.component';
import { MessageType } from './../enums/messageType.enum';
import { receivedTextMessage } from './../interfaces/receivedTextMessage.interface';
import { ISpectrumLobby } from './../interfaces/lobby.interface';
import { IBroadcasterListenerCallback } from "../interfaces/broadcaster-listener-callback.interface";

/**
 * @class State
 * Represents the current state of our Spectrum informations
 * watching the websocket to synchronise server-side and client-side information 
 */
export class SpectrumState {
    /** the currently bookmarked channels */
    protected bookmarks;
    /** the communities we have access to */
    protected communities: SpectrumCommunity[] = [];
    /** information on the bot member */
    protected member: ISpectrumUser;
    /** notifications of the bot */
    protected notifications;
    /** the list of private lobbies (i.e private messages) */
    protected private_lobbies;
    /** a role list */
    protected roles;

    /** used internally to represent what lobbies we're listening to */
    protected _SubscribedLobbies: SpectrumLobby[] = [];
    /** used internally to store the original state of things */
    protected _originalIdentify: ISpectrumIdentifyPacket;

    /** Our RSI API instance */
    private RSI: RSI = RSI.getInstance();
    /** Our RSI WS API instance  */
    private Broadcaster: SpectrumBroadcaster;
    /** our websocket connection to spectrum*/
    private ws: WebSocketConnection;

    private _isReady(a) { };
    private _hasFailed(a) { };

    private _broadcasterReadyEvent = new ReplaySubject<boolean>(1);

    /**
     * Creates a State Object
     * @param packet the Identify packet as sent by the RSI API
     * @param ws the RSI Spectrum websocket.
     */
    constructor(packet: ISpectrumIdentifyPacket) {
        this.newIdentifyPacket(packet);
    }

    /**
     * Return an event each time the broadcaster is sucessfully connected
     * @return the event
     */
    public get onBroadcasterReady(): ReplaySubject<boolean> {
        return this._broadcasterReadyEvent;
    }

    public getMember(): ISpectrumUser {
        return this.member;
    }

    /**
     * Updates the state with a new identify packet
     * @param packet the identify packet as sent by the RSI API
     */
    public newIdentifyPacket(packet: ISpectrumIdentifyPacket) {
        this._originalIdentify = packet;

        this.bookmarks = packet.bookmarks;
        this.communities = [];
        packet.communities.forEach((co: ISpectrumCommunity) => {
            this.communities.push(new SpectrumCommunity(co));
        });

        this.member = packet.member;
        this.member.id = Number(packet.member.id);

        this.notifications = packet.notifications;
        this.private_lobbies = packet.private_lobbies;
        this.roles = packet.roles;
    }

    /**
     * Convenience promise to track the first initialization of the API
     * @return a promise that will be true (and consumed) the next time the broadcaster is up and ready.
     */
    public whenReady(): Promise<boolean> {
        return this.onBroadcasterReady.filter((status) => status === true).first().toPromise();
    }


    /**
     * Method to re-send our current state to Spectrum on connection drop
     * 
     */
    private restoreWS() {
        // Re-subscribe to our previous lobbies
        this._SubscribedLobbies.forEach((lobby) => {
            console.log("[DEBUG] Restored lobby " + lobby.getLobby().name);
            this.Broadcaster.broadCastMessage(lobby.buildSubscribtionMessage());
        });
    }

    /**
     * Fonction to set the ws status as connected and listen for the ready signal.
     */
    public setWsConnected(ws: WebSocketConnection) {
        this.ws = ws;

        this.Broadcaster = SpectrumBroadcaster.getInstance();
        this.Broadcaster.setWs(ws, this);
        this.Broadcaster.setBot(this.member);

        this.Broadcaster.addListener("broadcaster.ready", () => {
            console.log("[STATE] BROADCASTER IS READY");
            this._broadcasterReadyEvent.next(true);
            this.restoreWS();
        });
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
     * Subscribes to a given lobby
     * @param lobby the lobby to subscribe to
     */
    public subscribeToLobby(lobby: SpectrumLobby) {
        this._SubscribedLobbies.push(lobby);
        this.Broadcaster.broadCastMessage(lobby.buildSubscribtionMessage());
    }

    /**
     * Checks if the supplied lobby is currently subscribed
     * @param lobby a SpectrumLobby object
     * @param id the id of the loby
     * @return whether or not we're subscribed to this lobby
     */
    public isSubscribedToLobby(lobby: SpectrumLobby): boolean;
    public isSubscribedToLobby(id: number): boolean;
    public isSubscribedToLobby(final): boolean {
        if (typeof final !== typeof 123) final = final.getLobby().id;
        return this._SubscribedLobbies.findIndex((lobby: SpectrumLobby) => Number(lobby.getLobby().id) === final) > -1
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
     * 
     * this is currently not updated before refresh.
     * 
     * @param name the name the category
     * @return Community if found, null otherwise.
     */
    public getCommunityByName(name: string): SpectrumCommunity {
        let n = name.toLowerCase();
        return this.communities.find((co: SpectrumCommunity) =>
            co.getRaw().name.toLowerCase() == n
        ) || null;
    }

    /**
     * Return the communities the bot can see 
     */
    public getCommunities(): SpectrumCommunity[] {
        return this.communities;
    }

    /**
     * Declare a global message listener for every message the bot will get to see.
     * @param callback the callback function on message.
     */
    public onMessage(callback = (message: receivedTextMessage) => { }): number {
        return this.Broadcaster.addListener("message.new", m => callback(m.message), {
            message: null
        });
    }

    /**
     * Declare a custom ws listener
     * @param messageType the type of message to listen for
     * @param callback the callback function to call when this listener is triggered
     * @param content the content of the message to check against
     * 
     * @return the unique id of the listener.
     */
    public onCustomListener(messageType, callback: IBroadcasterListenerCallback, content = null) {
        return this.Broadcaster.addListener(messageType, callback, content);
    }

    /**
     * Removes a custom listener,
     * We will stop listening for the listener and calling its callback.
     * 
     * @param listenerId the listener id to stop listening to. 
     */
    public removeCustomListener(listenerId: number) {
        this.Broadcaster.removeListener(listenerId);
    }

    /**
     * Sets the bot public presence on spectrum
     * @param status the status
     * @param info the "sub-status"
     */
    public setBotPresence(status: "away" | "online" | "playing" | "do_not_disturb" | "invisible", info?: string) {
        return this.RSI.post("api/spectrum/member/presence/setStatus", { status: status, info: info });
    }


}