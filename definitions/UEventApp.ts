import {EventBus} from "./eventBus";
import {EventApp} from "./EventApp";

/**
 * @description used to pass uninitialized app to event engine and let the event engine initialize it
 */
export interface UEventApp<T> {
    new({tag, event_bus, args}: { tag: string, event_bus: EventBus, args: T }): EventApp;
}
