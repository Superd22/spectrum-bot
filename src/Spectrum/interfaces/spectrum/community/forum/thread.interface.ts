export interface ISpectrumThread {
    aspect: string;
    channel_id: string;
    content_reply_id: string
    highlight_role_id: any;
    id: string;
    is_erased: boolean
    is_locked: boolean
    is_new: boolean
    is_pinned: boolean
    is_sinked: boolean
    label: boolean
    latest_activity: any;
    member: any;
    replies_count: number
    slug: string
    subject: string
    subscription_key: string
    time_created: number
    time_modified: number
    tracked_post_role_id: null
    type: string
    views_count: number
    votes: { count: number, voted: number }
}