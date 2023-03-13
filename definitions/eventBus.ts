//EventBus: EventBus with onAny() method to listen to all events
import * as EventEmitter from "events";

export class EventBus extends require("events") {
    // @ts-ignore
    emit(eventName: string | symbol, ...args): boolean {
        super.emit(eventName, ...args);
        super.emit("*", eventName, ...args);
        return true;
    }

    onAny(callback: (event: string, ...args: any[]) => void): EventEmitter {
        return this.on("*", callback);
    }
}
