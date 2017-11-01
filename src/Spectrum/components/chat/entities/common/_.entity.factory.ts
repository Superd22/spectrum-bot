import { emojioneList } from './../../../shared/emoji.component';
import { ContentState, ContentBlock, Modifier, SelectionState } from 'draft-js';
import { IDraftJSEntity } from './../../rich-text.component';

export abstract class DraftJSEntityFactory {
    protected _state: ContentState

    constructor(state: ContentState) {
        this._state = state;
    }

    /**
     * Parse the emojis in the supplied state
     * @return ContentState with parsed emojis
     */
    public parse(): ContentState {
        this.beforeParse();

        this._state = this._state.getBlockMap().reduce((state, block) => {
            state = this.parseBlock(state, block);
            return state;
        }, this._state);

        return this._state;
    }

    /**
     * Called before the parsing at block level starts
     */
    protected beforeParse() {

    }

    /**
     * Do the actual parsing for a given block
     * @param state 
     * @param block 
     */
    protected abstract parseBlock(state: ContentState, block: ContentBlock): ContentState;
}