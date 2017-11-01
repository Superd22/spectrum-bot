import { IDraftJSEntity } from './../../rich-text.component';

export interface IDraftJSEntityLink extends IDraftJSEntity<"LINK", { href: string }> { }
export class DraftJSEntityLink implements IDraftJSEntityLink {
    public type: "LINK" = "LINK";
    public mutability: "IMMUTABLE" = "IMMUTABLE";
    data: { href: string } = { href: "" };
    constructor(url: string) {
        this.data.href = url;
    }
}