/**
 * @module Spectrum
 */ /** */

/**
 * Describes the user data as returned by the RSI API
 * @interface User
 */
export interface User {
    /** url for the avatar of the user */
    avatar:string,
    /** Community Monicker of the user */
    displayname:string,
    /** Spectrum ID for the user this is **not** the CITIZEN ID */
    id:number,
    /** Handle for the user */
    nickname:string,
}