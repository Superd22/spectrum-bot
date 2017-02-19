import { Websocket } from 'websocket';
import { SpectrumLobby } from './lobby.component';
import { Identify } from './identify.interface';
import { RSI } from './../RSI/rsi.service';
export class State {

    protected bookmarks;
    protected communities;
    protected member;
    protected notifications;
    protected private_lobbies;
    protected roles;

    protected _SubscribedLobbies: SpectrumLobby[];
    protected _originalIdentify: Identify;

    private RSI: RSI = RSI.getInstance();
    private ws: Websocket;

    constructor(packet: Identify, ws: Websocket) {
        this._originalIdentify = packet;
        this.ws = ws;

        this.bookmarks = packet.bookmarks;
        this.communities = packet.communities;
        this.member = packet.member;
        this.notifications = packet.notifications;
        this.private_lobbies = packet.private_lobbies;
        this.roles = packet.roles;


        ws.on('message', (message) => {
            this.handleMessages(message)
        });
    }

    private handleMessages(message) {
        if (message.type === 'utf8') {
            console.log("[STATE] Message Received: '" + message.utf8Data + "'");
        }
    }

    public getSubscribedLobbies(): SpectrumLobby[] {
        return this._SubscribedLobbies;
    }

    public getAccessibleLobbies(): SpectrumLobby[] {
        var lobbies = [];

        this.communities.forEach(community => {
            community.lobbies.forEach(lob => {
                lobbies.push(new SpectrumLobby(lob));
            });
        });

        return lobbies;
    }


}