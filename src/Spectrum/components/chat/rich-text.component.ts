import { DraftJSEntityLinkFactory } from './entities/common/link.entity';
import { DraftJSEntityMentionFactory } from './entities/common/mention.entity';
import { DraftJSEntityEmojiFactory } from './entities/common/emoji.entity';
import { ContentState, Entity, SelectionState, Modifier, convertToRaw, RawDraftContentState } from 'draft-js';

/**
 * Handles the creation & parsing of rich text to be sent to the db
 */
export class SpectrumRichText implements ISpectrumRichText {

    protected _plainMsg: string;
    protected _contentState: ContentState;
    protected _styles = {
        BOLD: /(\*\*(?![\*]))((?:[^*]|\*(?!\*))+)(\*\*)/g,
        ITALIC: /(\*)([^*]+)(\*)/g,
        CODE: /(`)([^`]+)(`)/g,
        STRIKETHROUGH: /(~~(?![~]))((?:[^~]|~(?!~))+)(~~)/g,
        UNDERLINE: /(__(?![_]))((?:[^_]|_(?!_))+)(__)/g
    };

    public get plainText():string {
        return this._contentState.getPlainText();
    }

    /**
     * Creates a rich text message as expected by Spectrum
     * @param textMsg the text of the message
     */
    constructor(textMsg: string) {
        this._plainMsg = textMsg;
        this.constructContentState();
    }

    /**
     * Constructs the content state and tries to parse it.
     */
    protected constructContentState() {
        this._contentState = ContentState.createFromText(this._plainMsg);
        this.richParse();
    }

    /**
     * Performs the spectrum parsing in the right order
     */
    protected richParse() {
        this.applyInlineStyle();
        this.parseEntities();
    }

    /**
     * Parse entities (link/emojis/mentions ...)
     */
    protected parseEntities() {
        this._contentState = new DraftJSEntityLinkFactory(this._contentState).parse()
        this._contentState = new DraftJSEntityEmojiFactory(this._contentState).parse();
        // Mention is destructive and needs to be done **last**.
        this._contentState = new DraftJSEntityMentionFactory(this._contentState).parse();
    }


    /**
     * Applies inline styling (bold/italic/striketrhough...) on the content
     */
    protected applyInlineStyle() {
        this._contentState = this._contentState.getBlockMap().reduce((state, block) => {
            // if we're a code block; no markup.
            if ("code-block" === block.getType())
                return state;
            // get index of the current block
            let key = block.getKey();

            // For each style
            for (let style in this._styles)
                // as long as we have a match
                for (let regex = new RegExp(this._styles[style]), match = null; match = regex.exec(block.getText());)
                    // if we're not an entity (aka we're text)
                    if (!block.getEntityAt(match.index)) {
                        // Create a selection inside the current block
                        let selectionToReplace = SelectionState.createEmpty(key);
                        // Remove the opening code
                        state = Modifier.removeRange(state, <SelectionState>selectionToReplace.merge({
                            anchorOffset: match.index,
                            focusOffset: match.index + match[1].length
                        }), "forward");

                        // Remove the closing code
                        let lastMarkerIdx = match.index + match[2].length;
                        state = Modifier.removeRange(state, <SelectionState>selectionToReplace.merge({
                            anchorOffset: lastMarkerIdx,
                            focusOffset: lastMarkerIdx + match[3].length
                        }), "forward");

                        state = Modifier.applyInlineStyle(state, <SelectionState>selectionToReplace.merge({
                            anchorOffset: match.index,
                            focusOffset: lastMarkerIdx
                        }), style);

                        block = state.getBlockForKey(key);
                        regex.lastIndex -= match.input.length - block.getLength()
                    }
            return state;
        }, this._contentState)
    }

    /**
     * Returns a json representation of this rich text as expected by the spectrum back-end
     */
    public toJson():ISpectrumDraftJSRichText {
        return convertToRaw(this._contentState);
    }
}

export type ISpectrumDraftJSRichText = RawDraftContentState;

export interface ISpectrumRichText {
    toJson(): any
}

export interface IDraftJSEntity<TYPE, DATATYPE = any> {
    type: TYPE,
    mutability: "IMMUTABLE" | "MUTABLE";
    data?: DATATYPE,
}