import { IDraftJSEntity } from './../../rich-text.component';

export interface IDraftJSEntityEmoji extends IDraftJSEntity<"EMOJI", string> { }
export class DraftJSEntityLink implements IDraftJSEntityEmoji {
    public type: "EMOJI" = "EMOJI";
    public mutability: "IMMUTABLE" = "IMMUTABLE";
    data: string = "";
    constructor(emoji: string) {
        this.data = emoji;
    }
}