import {EventBus} from "./eventBus";
import {EventApp} from "./EventApp";

export interface UEventApp<T> {
    new({tag, event_bus, args}: { tag: string, event_bus: EventBus, args: T }): EventApp;
}
