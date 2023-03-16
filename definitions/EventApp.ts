import {EventBus} from "./eventBus";
import {EventAppStatus} from "../types";

/**
 * @description base class for all event apps
 */
export abstract class EventApp {

    tag: string;
    private event_bus: EventBus;
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
        methods.forEach(this.getProxyCallBack());

    }

    emit(event: string, data: any) {
        if (!(event === (this.tag))) {
            this.event_bus.emit({event, data})
        }
    }

    ready(){
        this.status = "ready";
        this.emit("ready", {tag: this.tag});
    }

    on(event: string, listener: any) {
        this.event_bus.on(event, listener);
    }

    onAny(callback: (event: string, ...args: any[]) => void) {
        this.event_bus.onAny(callback)
    }

    abstract init(): Promise<any>


    abstract destroy(): void;


    /**
     * @description execute the app
     * @param data
     * @param status
     */
    abstract exec(
        data:any, status:{on_error?: (error: any) => void, on_success?: (data: any) => void}
    ): Promise<any>

    private getProxyCallBack() {
        return (method: string) => {
            if (method !== "constructor") {
                // @ts-ignore
                this[method] = this[method].bind(this);
                // @ts-ignore
                this[method] = new Proxy(this[method], {
                    apply: async (target, thisArg, args) => {
                        try {
                            if (!target.apply) {
                                this.event_bus
                                    // .emit("error", new Error(`method ${method} is not a function`))
                                    .emit({
                                        event: "error",
                                        data: new Error(`method ${method} is not a function`)
                                    })
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
                            this.event_bus.emit({
                                event: "error",
                                data: error
                            })
                        }
                    }
                })
            }

        };
    }
}
