import { ContentState, RawDraftContentState } from "draft-js";

/**
 * @module Spectrum
 */ /** */

export interface ISpectrumTextMessage extends ISpectrumTextPacket {
    /** the id of the message */
    id?,
    /** timestamp of creation */
    time_created?,
    /** timestamp of last edit */
    time_modified?,
};

export interface ISpectrumTextPacket {
    /** the id of the lobby in which this text is posted */
    lobby_id: number,
    /** the editor content of this message */
    content_state: RawDraftContentState,
    /** the roled used to post this message */
    highlight_role_id?,
    /** the media id of the embed */
    media_id?,
    /** the plaintext content of the message */
    plaintext: string,
}