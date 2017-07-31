import { IBroadcasterListenerCallback } from "./broadcaster-listener-callback.interface";

export interface IBroadcasterListener {
    type: string,
    content: any,
    callback: IBroadcasterListenerCallback,
}