import { ContentState, ContentBlock, SelectionState, Modifier } from 'draft-js';
import { IDraftJSEntity } from './../../rich-text.component';
import { DraftJSEntityFactory } from './_.entity.factory';
export interface IDraftJSEntityMention extends IDraftJSEntity<"MENTION", { id: number }> { }
export class DraftJSEntityMention implements IDraftJSEntityMention {
    public type: "MENTION" = "MENTION";
    public mutability: "IMMUTABLE" = "IMMUTABLE";
    data = { id: 0 };
    constructor(spectrumUserId: number) {
        this.data.id = spectrumUserId;
    }
}

export class DraftJSEntityMentionFactory extends DraftJSEntityFactory {

    /** regex for finding a mention as generetated internaly */
    protected _regex = new RegExp(/<scAPIM>@([^ ]+?):(\d+)<\/scAPIM>/gi);

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

        // Offset as we're gonna change our buffer
        let offset = 0;

        // Try and get an emoji
        for (let match = null; match = this._regex.exec(block.getText());) {
            const mention = new DraftJSEntityMention(match[2]);

            state.createEntity(mention.type, mention.mutability, mention.data);
            const mentionId = state.getLastCreatedEntityKey();
            const replaceText = "@" + match[1];

            // if we're not an entity (aka we're text)
            if (!block.getEntityAt(match.index)) {
                let selectionToReplace = SelectionState.createEmpty(key);

                // Replace our text and set the entity
                state = Modifier.replaceText(state,
                    <SelectionState>selectionToReplace.merge({
                        anchorOffset: match.index,
                        focusOffset: match.index + match[0].length
                    }),
                    replaceText,
                    null,
                    mentionId,
                );

            }

            // We're actively modyfing the buffer, so keep that in mind.
            block = state.getBlockForKey(key);
            this._regex.lastIndex -= match.input.length - block.getLength()
        }

        return state;
    }
}