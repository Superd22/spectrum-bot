import { emojioneList } from './../../../shared/emoji.component';
import { ContentState, ContentBlock, Modifier, SelectionState } from 'draft-js';
import { IDraftJSEntity } from './../../rich-text.component';
import { DraftJSEntityFactory } from './_.entity.factory';

export interface IDraftJSEntityEmoji extends IDraftJSEntity<"EMOJI", string> { }
export class DraftJSEntityEmoji implements IDraftJSEntityEmoji {
    public type: "EMOJI" = "EMOJI";
    public mutability: "IMMUTABLE" = "IMMUTABLE";
    data: string = "";
    constructor(emoji: string) {
        this.data = emoji;
    }
}
export class DraftJSEntityEmojiFactory extends DraftJSEntityFactory {
    /** regex for any given emoji */
    private static _emojis: string;

    constructor(state: ContentState) {
        super(state);

        // Build the regex once
        if (!DraftJSEntityEmojiFactory._emojis) {
            DraftJSEntityEmojiFactory._emojis = Object.keys(emojioneList).join("|");
        }
    }

    /**
     * Parse emojis in a given block
     * @param state 
     * @param block 
     */
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
        for (let regex = new RegExp(DraftJSEntityEmojiFactory._emojis), match = null; match = regex.exec(text);) {
            const emoji = new DraftJSEntityEmoji(match[0]);

            state.createEntity(emoji.type, emoji.mutability, emoji.data);
            const emojiId = state.getLastCreatedEntityKey();

            // if we're not an entity (aka we're text)
            if (!block.getEntityAt(match.index)) {
                let selectionToReplace = SelectionState.createEmpty(key);
                // Apply the emoji
                state = Modifier.applyEntity(
                    state,
                    <SelectionState>selectionToReplace.merge({
                        anchorOffset: match.index + offset,
                        focusOffset: match.index + (offset) + match[0].length
                    }),
                    emojiId
                );


                // Remove the emoji from our buffer
                text = text.replace(match[0], "");
                // Remember that we've removed text, so we offset.
                offset += (match[0].length);
            }

        }

        return state;
    }
}