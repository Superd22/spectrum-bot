import { IBroadcasterListener } from '../interfaces/api/broadcaster-listener.interface';

/**
 * @module Spectrum
 */ /** */

import { SpectrumState } from './state.service';
import { WebSocketConnection } from 'websocket';
import { IBroadcasterListenerCallback } from "../interfaces/api/broadcaster-listener-callback.interface";

/**
 * ## Broadcaster
 * Handles the broadcast of every WS messages
 * @class Broadcaster
 */
export class SpectrumBroadcaster {
    /** the WebSocket connection */
    protected _ws: WebSocketConnection;
    /** the singleton Broadcaster */
    protected static _instance: SpectrumBroadcaster = new SpectrumBroadcaster();
    protected _state: SpectrumState;
    /** our message listeners */
    protected _listerners: Map<number, IBroadcasterListener> = new Map<number, IBroadcasterListener>();
    protected member;

    /**
     * Constructs the singleton Broadcaster
     * @throws Error Throws an error on double instanciation
     */
    constructor() {
        if (SpectrumBroadcaster._instance) {
            throw new Error("Error: Instantiation failed: Use Broadcast.getInstance() instead of new.");
        }
        SpectrumBroadcaster._instance = this;
    }

    /**
     * Sets the WS once connected and starts listening
     * @param ws the ws to spectrum
     */
    public setWs(ws: WebSocketConnection, state: SpectrumState) {
        this._ws = ws;
        this._state = state;

        this._ws.on('message', (message) => {
            this.handleMessages(message);
        });
    }

    public setBot(botM) {
        this.member = botM;
    }

    public getMember() {
        return this.member;
    }

    /**
     * Returns the singleton instance of the Broadcaster
     * @return The instance
     * @throws Error on no broadcaster init
     */
    public static getInstance(): SpectrumBroadcaster {
        if (!SpectrumBroadcaster._instance) throw new Error("Error: No Instance of BroadCaster. Did you Call Spectrum.Init() ?")
        return SpectrumBroadcaster._instance;
    }

    /**
     * Broadcasts a message to the ws connection
     * @param msg the message to send.
     * @param raw send as raw data or stringified. defaults to stringified
     * @throws Error on no ws connection.
     */
    public broadCastMessage(msg: any, raw: boolean = false) {
        if (!this._ws.connected) {

            throw new Error("Error: WebSocket isn't connected");
        }

        let payload = raw ? msg : JSON.stringify(msg);
        console.log("[WSS] SENDING MESSAGE " + payload);
        this._ws.sendUTF(payload);
    }

    /**
     * Main callback for every messages received via websocket.
     * Checks against listeners and callsback.
     * @param message the message received
     */
    private handleMessages(message) {
        if (message.type === 'utf8') {
            console.log("[WSS] Message Received: '" + message.utf8Data + "'");
        }

        let payload = JSON.parse(message.utf8Data);

        this._listerners.forEach((listener, i) => {
            if (!payload.type || payload.type.indexOf(listener.type) !== 0) return;

            if (this.testObjects(payload, listener.content)) {
                console.log("[BROADCASTER] Calling LISTENER " + i);
                listener.callback(payload);
            }
        });

    }

    /**
    * Test between two objects
    * @todo do this better ? idk
    */
    private testObjects(obj1, obj2) {
        if (obj2 === null) return true;
        if (obj1 == obj2 && !(obj2 instanceof Object)) return true;

        if (obj2 instanceof Object)
            for (var p in obj2) {
                // Doesn't exist and we wanted it.
                if (!obj1[p]) return false;
                // Exist but mismatch
                if (obj1[p] != obj2[p]) {
                    // wildcard is okay
                    if (obj2[p] === null) continue;

                    // Not a wildcard and can't recurse
                    if (!(obj2[p] instanceof Object)) return false;

                    // Can recurse
                    if (!this.testObjects(obj1[p], obj2[p])) return false;
                }
            }

        return true;
    }

    /**
     * Adds a listener to get ws messages
     * @param messageType the type of message to subscribe to
     * @param content the data to filter by
     * @param callback the function to call on hit
     * @return the id of the newly created listener
     */
    public addListener(messageType: string, callback: IBroadcasterListenerCallback, content = null): number {
        let key = this.lowestUnUsedId();
        this._listerners.set(key,
            {
                type: messageType,
                content: content,
                callback: callback,
            }
        );

        return key;
    }

    /**
     * Returns the lowest un-used id for in our listeners map.
     * @return number the lowest index that can be safely set in.
     */
    private lowestUnUsedId(): number {
        for (let i = 0; i <= this._listerners.size; i++) {
            if (!this._listerners.has(i)) return i;
        }
    }

    /**
     * Returns the state associated to this broadcaster instance
     */
    public getState(): SpectrumState {
        return this._state;
    }

    /**
     * Removes a Listener 
     * @param listenerId the id given by AddListener
     */
    public removeListener(listenerId: number) {
        if (this._listerners[listenerId]) {
            this._listerners.delete(listenerId);
        }
    }

}