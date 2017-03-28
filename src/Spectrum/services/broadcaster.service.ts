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
    /** our message listeners */
    protected _listerners=[];
    protected member;

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

    /**
     * Sets the WS once connected and starts listening
     * @param ws the ws to spectrum
     */
    public setWs(ws:WebSocketConnection) {
        this._ws = ws;
        this._ws.on('message', (message) => {
            this.handleMessages(message);
        });

    }

    /**
     * Broadcast a keep alive msg for the ws stream
     */
    private keepAlive() {
        // Spectrum seems to just send a raw 8 for keepalive...
        this.broadCastMessage(8, true);
        setTimeout(() => this.keepAlive(), 60*60*1000);
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
    public static getInstance(): Broadcaster {
        if(!Broadcaster._instance) throw new Error("Error: No Instance of BroadCaster. Did you Call Spectrum.Init() ?")
        return Broadcaster._instance;
    }

    /**
     * Broadcasts a message to the ws connection
     * @param msg the message to send.
     * @param raw send as raw data or stringified. defaults to stringified
     * @throws Error on no ws connection.
     */
    public broadCastMessage(msg:any, raw:boolean=false) {
        if(!this._ws.connected) throw new Error("Error: WebSocket isn't connected");

        let payload = raw ? msg : JSON.stringify(msg);
        console.log("[WSS] : SENDING MESSAGE " + payload);
        this._ws.sendUTF(payload);
    }

    /**
     * Main callback for every messages received via websocket.
     * Checks against listeners and callsback.
     * @param message the message received
     */
    private handleMessages(message) {
        if (message.type === 'utf8') {
            console.log("[STATE] Message Received: '" + message.utf8Data + "'");
        }

        let payload = JSON.parse(message.utf8Data);
        for(var i=0; i < this._listerners.length; i++) {
            let listener = this._listerners[i];
            if(!payload.type || payload.type.indexOf(listener.type) !== 0) continue;

            if(this.testObjects(payload, listener.content)) {
                console.log("calling LISTENER "+i);
                listener.callback(payload);
            }
        }

    }

    /**
    * Test between two objects
    * @todo do this better ? idk
    */
    private testObjects(obj1,obj2) {
        if(obj2 === null) return true;
        if(obj1 == obj2 && !(obj2 instanceof Object)) return true;

        if(obj2 instanceof Object)
        for(var p in obj2) {
            // Doesn't exist and we wanted it.
            if(!obj1[p]) return false;
            // Exist but mismatch
            if(obj1[p] != obj2[p]) {
                // wildcard is okay
                if(obj2[p] === null) continue;
            
                // Not a wildcard and can't recurse
                if (!(obj2[p] instanceof Object)) return false;

                // Can recurse
                if(!this.testObjects(obj1[p],obj2[p])) return false;     
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
    public addListener(messageType, callback, content=null):number {
        return this._listerners.push(
            {
                type: messageType,
                content: content,
                callback: callback,
            }
        );
    }

    /**
     * Removes a Listener 
     * @param listenerId the id given by AddListener
     */
    public removeListener(listenerId:number) {
        if(this._listerners[listenerId])
            this._listerners.splice( listenerId , 1 );
    }

}