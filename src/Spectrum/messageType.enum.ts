export enum MessageType {
    /** When the wss has finished loading */
    "broadcaster.ready",
    /** When an user changes status in a subscribed environement */
    "member.presence.update",
    /** when an user has his role changed in a environement */
    "member.roles.update"
}