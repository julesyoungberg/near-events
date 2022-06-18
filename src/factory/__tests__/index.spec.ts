import { VMContext, u128 } from "near-sdk-as";
import { MIN_ACCOUNT_BALANCE } from "../../utils";

import { newEventDetails } from "../../__mocks__/event"

import * as contract from "../assembly";

// config
const EVENT_NAME = "spaceparty";

// helper functions
const attachDeposit = (deposit: u128): void => {
    VMContext.setAttached_deposit(deposit);
};

const attachMinBalance = (): void => {
    attachDeposit(MIN_ACCOUNT_BALANCE);
};

// tests
describe("create_event()", () => {
    it("creates and saves the event", () => {
        attachMinBalance();
        expect(() => {
            contract.create_event(EVENT_NAME, newEventDetails());
        }).not.toThrow();
    });

    it("rejects invalid names", () => {
        attachMinBalance();
        expect(() => {
            contract.create_event("_", newEventDetails());
        }).toThrow();
    });

    it("requires a min deposit", () => {
        expect(() => {
            contract.create_event(EVENT_NAME, newEventDetails());
        }).toThrow();
    });

    // @todo fix if possible
    // it("rejects a name that already exists", () => {
    //     contract.create_event(EVENT_NAME, newEventDetails());
    //     expect(() => {
    //         contract.create_event(EVENT_NAME, newEventDetails());
    //     }).toThrow();
    // });
});
