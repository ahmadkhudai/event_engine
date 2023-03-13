//types for an event driven system
import {EventBus} from "./definitions/eventBus";
import {UEventApp} from "./definitions/UEventApp";
import {AppRegistry} from "./types";


export class EventEngine {
    //registers apps
    //send events to apps through event bus

    private readonly event_bus: EventBus;
    private appRegistry: AppRegistry = {};

    constructor(EventEmitter: EventBus) {
        this.event_bus = EventEmitter;
    }

    registerApp<T>(tag: string, app: UEventApp<T>, args: T) {
        if (this.appRegistry[tag]) throw new Error("App with tag " + tag + " already registered!")

        this.appRegistry[tag] = this.constructApp(app, tag, args);

        this.registerTag(tag, this.appRegistry[tag].exec);
        this.setUpHandlers(tag);
        this.setUpInterAppLink(tag);
        //finally, call init on app
        this.initializeApp(tag);
    }

    //emit
    emit(event: string, data: any) {
        this.event_bus.emit(event, data)
    }

    on(event: string, listener: any) {
        this.event_bus.on(event, listener);
    }

    private setUpHandlers(tag: string) {
        this.setUpInitHandler(tag);
        this.setUpErrorHandler(tag);
        this.setUpDestructHandler(tag);
    }

    private constructApp<T>(app: UEventApp<T>, tag: string, args: T) {
        try {
            return new app({tag, event_bus: new EventBus(), args: args});
        } catch (error) {
            throw new Error("Error creating app with tag " + tag + " : " + error)
        }
    }

    private setUpErrorHandler(tag: string) {
        this.appRegistry[tag].on("error", (error: Error) => {
            this.appRegistry[tag].status = "error";
            console.log("\n\n...")
            console.log(tag + " errored ")
            console.log("-------------------")
            console.error(error);
            console.log("-------------------")
            console.log("-------------------")
        })
    }

    private setUpInitHandler(tag: string) {

        this.appRegistry[tag].on("ready", (_: any) => {
            console.log(tag, " ready")
        })
    }

    private setUpDestructHandler(tag: string) {
        this.appRegistry[tag].on("destroy", (tag: string) => {
            this.appRegistry[tag].status = "stopped";
        })
    }

    private setUpInterAppLink(tag: string) {
        this.appRegistry[tag].onAny((event: string, ...args: any[]) => {
            if (!this.isCallingSelf(event, tag)) {
                this.emit(event, args)
            }
        })
    }

    private initializeApp(tag: string) {
        this.appRegistry[tag].init().catch((error) => {
            console.log("Error initializing app with tag " + tag + " : " + error)
        })
    }

    private registerTag(tag: string, callback: (event_name: string, ...args: unknown[]) => void) {
        this.event_bus.on(tag, callback)
    }

    private isCallingSelf(event: string, tag: string) {
        return event === tag || event.split(":")[0] === tag
    }

}
