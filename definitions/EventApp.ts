import {EventBus} from "./eventBus";
import {EventAppStatus} from "../types";

export abstract class EventApp {

    tag: string;
    event_bus: EventBus;
    status: EventAppStatus = "uninitialized";

    protected constructor(
        {tag, event_bus}: {
            tag: string,
            event_bus: EventBus
        }
    ) {
        this.tag = tag;
        this.event_bus = event_bus;

        //     proxy all class methods and catch any uncaught errors
        const methods = Object.getOwnPropertyNames(this.constructor.prototype);
        methods.forEach((method: string) => {
                if (method !== "constructor") {
                    // @ts-ignore
                    this[method] = this[method].bind(this);
                    // @ts-ignore
                    this[method] = new Proxy(this[method], {
                        apply: async (target, thisArg, args) => {
                            try {
                                if (!target.apply) {
                                    this.event_bus
                                        .emit("error", new Error(`method ${method} is not a function`))
                                }
                                return await target.apply(thisArg, args)

                            } catch (error) {
                                console.log(
                                    "Error in event handler: " +
                                    this.tag +
                                    " " +
                                    method +
                                    " " +
                                    error
                                )
                                this.event_bus.emit("error", error);
                            }
                        }
                    })
                }

            }
        );

    }

    emit(event: string, data: any) {
        if (!(event === (this.tag))) {
            this.event_bus.emit(event, data)
        }
    }

    ready(){
        this.status = "ready";
        this.emit("ready", {tag: this.tag});
    }

    on(event: string, listener: any) {
        this.event_bus.on(event, listener);
    }

    // onAny = this.event_bus.onAny;
    onAny(callback: (event: string, ...args: any[]) => void) {
        console.log("onAny " + this.tag)
        this.event_bus.onAny(callback)
    }


    abstract init(): Promise<any>


    abstract destroy(): void;

    abstract exec(
        event_name: string,
        ...args: unknown[]
    ): Promise<any>
}
