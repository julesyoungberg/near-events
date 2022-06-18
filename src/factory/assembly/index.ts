import { base58, context, ContractPromise, ContractPromiseBatch, env, logging, PersistentSet, u128 } from "near-sdk-as";

import { EventDetails } from "../../types";
import { AccountId, MIN_ACCOUNT_BALANCE, XCC_GAS } from "../../utils";

import { EventInitializeArgs, OnEventCreatedArgs } from "./models";

const EVENT_CODE = includeBytes("../../../build/debug/event.wasm");

/**
 * The Factory contract provides an interface for creating and managing events.
 * It keeps track of events so they are easy to view.
 * Largely based on: https://github.com/Learn-NEAR/NCD.L1.sample--near-analytics/blob/main/analytics/assembly/index.ts
 */

/**
 * Storage
 */
export const events = new PersistentSet<AccountId>("ev");

/**
 * =================================
 * Public Methods
 * =================================
 */

/**
 * Initializes a new event contract.
 */
export function create_event(name: AccountId, details: EventDetails): void {
    const accountId = full_account_for(name)

    assert(env.isValidAccountID(accountId), "Event name must be valid NEAR account name");
    assert(!events.has(accountId), "Event name already exists");

    // @todo improve error message
    assert(
        u128.ge(context.attachedDeposit, MIN_ACCOUNT_BALANCE),
        "MIN_ACCOUNT_BALANCE must be attached to initialize"
    );

    logging.log("creating event contract");

    let promise = ContractPromiseBatch.create(accountId)
        .create_account()
        .deploy_contract(Uint8Array.wrap(changetype<ArrayBuffer>(EVENT_CODE)))
        .add_full_access_key(base58.decode(context.senderPublicKey));

    logging.log("initializing event");

    promise.function_call(
        "initialize",
        new EventInitializeArgs(details),
        context.attachedDeposit,
        XCC_GAS
    );

    promise.then(context.contractName).function_call(
        "on_event_created",
        new OnEventCreatedArgs(name),
        u128.Zero,
        XCC_GAS
    );
}

/**
 * Callback to handle event creation result.
 */
export function on_event_created(name: AccountId): void {
    logging.log("Gas used: " + env.used_gas.toString());

    const accountId = full_account_for(name);
    
    let results = ContractPromise.getResults();
    let event_created = results[0];

    switch (event_created.status) {
        case 0:
            logging.log("Event creation for [ " + accountId + " ] is pending");
            break;
        case 1:
            logging.log("Event creation for [ " + accountId + " ] succeeded");
            events.add(name);
            break;
        case 2:
            logging.log("Event creation for [ " + accountId + " ] failed");
            break;
        default:
            logging.log("Unexpected value for promise result [ " + event_created.status.toString() + " ]");
            break;
    }

    logging.log("Gas used: " + env.used_gas.toString());
}

/**
 * Returns the NEAR Account IDs of the events.
 */
export function get_event_names(): AccountId[] {
    return events.values();
}

/**
 * Returns a list of event info structs.
 * @todo finish or remove
 */
// export function get_events(): EventInfo[] {
//     const eventIds = events.values();
//     const info: EventInfo[] = [];

//     for (let i: u32 = 0; i < eventIds.length; i++) {
//         const accountId = full_account_for(eventIds[i]);
//         let promise = ContractPromise.create(accountId, "get_details", new EmptyArgs(), XCC_GAS);

//         // @todo is it possible to get the result here?
//     }

//     return info;
// }

/**
 * =================================
 * Private Methods
 * =================================
 */

function full_account_for(dataset: string): string {
    return dataset + "." + context.contractName;
}
