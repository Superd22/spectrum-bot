/**
 * @module Spectrum
 */ /** */


import { WebSocketConnection } from 'websocket';

/**
 * ## Broadcaster
 * Handles the broadcast of every WS messages
 * @class Broadcaster
 */
export class Broadcaster {
    /** the WebSocket connection */
    protected _ws:WebSocketConnection;
    /** the singleton Broadcaster */
    protected static _instance:Broadcaster = new Broadcaster();

    /**
     * Constructs the singleton Broadcaster
     * @throws Error Throws an error on double instanciation
     */
    constructor() {
        if (Broadcaster._instance) {
            throw new Error("Error: Instantiation failed: Use Broadcast.getInstance() instead of new.");
        }
        Broadcaster._instance = this;
    }

    public setWs(ws:WebSocketConnection) {
        this._ws = ws;
    }

    /**
     * Returns the singleton instance of the Broadcaster
     * @return The instance
     * @throws Error on no broadcaster init
     */
    public static getInstance(): Broadcaster {
        if(!Broadcaster._instance) throw new Error("Error: No Instance of BroadCaster. Did you Call Spectrum.Init() ?")
        return Broadcaster._instance;
    }

    /**
     * Broadcasts a message to the ws connection
     * @param msg the message to send.
     * @throws Error on no ws connection.
     */
    public broadCastMessage(msg:any) {
        if(!this._ws.connected) throw new Error("Error: WebSocket isn't connected");

        let payload = JSON.stringify(msg);
        console.log("[WSS] : SENDING MESSAGE " + payload);
        this._ws.sendUTF(payload);
    }

}