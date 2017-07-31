import { ISpectrumChannel } from './channel.interface';
/**
 * @module Spectrum
 */ /** */

/**
 * Describes a channel/forum group (or channel category) belonging to a community
 * i.e : "Community" or "Shipyards" in the "Star Citizen" community.
 */
export interface ISpectrumChannelGroup {
    /** array of channels (= forums) in this group */
    channels: ISpectrumChannel[];
    /** id of the parent community for this group */
    community_id: string;
    /** id of this group */
    id: string;
    /** display name of this group */
    name: string;
    /** order of display in the list (asc-sorted) */
    order: number;
}