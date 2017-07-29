/**
 * @module Spectrum
 */ /** */

export interface ISpectrumTextMessage {
    /** the plaintext content of the message */
    plaintext:string,
    /** the id of the lobby in which this text is posted */
    lobby_id:number,
    /** content_state:{
        blocks:Array<any>,
        entityMap:any,
    }*/
    media_id?,
    highlight_role_id?,
    id?,
    time_created?,
    time_modified?,
}