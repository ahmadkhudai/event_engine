import {EventApp} from "../definitions/EventApp";

export type EventAppStatus = "ready" | "stopped" | "error" | "uninitialized";
export type AppRegistry = {
    [tag: string]:  EventApp
}
