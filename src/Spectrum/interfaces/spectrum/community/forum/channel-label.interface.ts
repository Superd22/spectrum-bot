/**
 * Describes a channel label (= tag) that can be included to further distinguish a thread 
 * -r.i.p sub-forums-
 */
export interface ISpectrumChannelLabel {
    /** the channel this tag belongs to */
    channel_id: string;
    /** the id of this label */
    id: string;
    /** display name */
    name: string;
    notification_subscription: any;
    subscription_key: string;
}