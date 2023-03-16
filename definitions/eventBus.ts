//EventBus: EventBus with onAny() method to listen to all events
import * as EventEmitter from "events";

export class EventBus extends require("events") {
    emit({
             event,
             data,
             on_success = () => {},
             on_error = (err) => {}
         }: {
        event: string,
        data: any,
        on_success?: () => void,
        on_error?: (error: Error) => void
    }) {
        super.emit(event, data, {});
        super.emit("*", event, data, {
            on_success,
            on_error
        });
        if (on_success) on_success();
        return true;
    }

    onAny(callback: (event: string, ...args: any[]) => void): EventEmitter {
        return this.on("*", callback);
    }
}
