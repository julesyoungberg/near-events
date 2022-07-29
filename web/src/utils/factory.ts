import { EventDetails } from "./event";

const GAS = 100000000000000;

export function createEvent(name: string, details: EventDetails) {
    return window.contract.create_event(name, details);
}

export function getEventNames() {
    return window.contract.get_event_names();
}
