/**
 * @module Spectrum
 */ /** */

import { ISpectrumChannelLabel } from './channel-label.interface';
/**
 * Describes a channel/forum group (or channel category) belonging to a community
 * i.e : "Community" or "Shipyards" in the "Star Citizen" community.
 */
import { SpectrumThreadSortFilter } from "./thread-sort-filter.type";

export interface ISpectrumChannel {
    /** display color of this channel in hex without the # (ie: 000000 for black) */
    color: string;
    /** id of the community this channel belongs to */
    community_id: string;
    /** display description (sub-title) */
    description: string;
    /** id of the channel-group this channel belongs to */
    group_id: string;
    id: string;
    label_required: boolean;
    labels: ISpectrumChannelLabel[];
    name: string;
    order: number;
    permissions: any
    sort_filter: SpectrumThreadSortFilter;
    subscription_key: string;
    /** number of threads in this channel */
    threads_count: number;
}