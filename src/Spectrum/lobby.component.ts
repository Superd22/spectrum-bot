import { RSI } from './../RSI/rsi.service';
import { Lobby } from './lobby.interface';

export class SpectrumLobby {
    private _lobby: Lobby;
    private _community;
    private rsi: RSI = RSI.getInstance();

    constructor(lobby: Lobby) {
        this._lobby = lobby;
    }

    public sendPlainTextMessage(text): Promise<any> {
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
            lobby_id: this._lobby.id,
            media_id: null,
            plaintext: text,
        };

        return this.rsi.post("api/spectrum/message/create", m).then(res => console.log(res.body.data));
    }

    public getHistory() {

    }

    public getMessages() {
        this.getHistory();
    }

    public getPresence() {

    }

    public getCommunity() {

    }

    public join() {

    }

    public leave() {

    }


}