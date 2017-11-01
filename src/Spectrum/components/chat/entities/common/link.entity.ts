import { ContentState, ContentBlock, SelectionState, Modifier } from 'draft-js';
import { IDraftJSEntity } from './../../rich-text.component';
import { DraftJSEntityFactory } from './_.entity.factory';

export interface IDraftJSEntityLink extends IDraftJSEntity<"LINK", { href: string }> { }
export class DraftJSEntityLink implements IDraftJSEntityLink {
    public type: "LINK" = "LINK";
    public mutability: "IMMUTABLE" = "IMMUTABLE";
    data: { href: string } = { href: "" };
    constructor(url: string) {
        this.data.href = url;
    }
}

export class DraftJSEntityLinkFactory extends DraftJSEntityFactory {

    /** regex for finding a link */
    protected _regex = new RegExp('(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name and extension
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?' + // port
        '(\\/[-a-z\\d%@_.~+&:]*)*' + // path
        '(\\?[;&a-z\\d%@_.,~+&:=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?', 'i'); // fragment locator

    constructor(state: ContentState) {
        super(state);
    }

    protected parseBlock(state: ContentState, block: ContentBlock) {
        // if we're a code block; no markup.
        if ("code-block" === block.getType())
            return state;

        // get index of the current block
        let key = block.getKey();
        let text = block.getText();

        let offset = 0;


        // Try and get a link
        for (let match = null; match = this._regex.exec(text);) {
            const link = new DraftJSEntityLink(match[0]);
            state.createEntity(link.type, link.mutability, link.data);
            const linkId = state.getLastCreatedEntityKey();



            // if we're not an entity (aka we're text)
            if (!block.getEntityAt(match.index)) {
                let selectionToReplace = SelectionState.createEmpty(key);

                // Apply the link
                state = Modifier.applyEntity(
                    state,
                    <SelectionState>selectionToReplace.merge({
                        anchorOffset: match.index + offset,
                        focusOffset: match.index + offset + match[0].length
                    }),
                    linkId
                );

                // Remove the link from our buffer
                text = text.replace(match[0], "");
                // Remember that we've removed text, so we offset.
                offset += (match[0].length);
            }

        }

        return state;
    }
}