// @nearfile out
import { context, storage, u128 } from "near-sdk-as";

import { EventDetails } from "../../types";
import { AccountId, MIN_ACCOUNT_BALANCE } from "../../utils";

import { Event, EVENT_KEY } from "./models";

/**
 * The Event contract represents a real-world or virtual event.
 * Events have a location, a date, a list of hosts, a list of guests, and a list of tickets.
 * Tickets can be purchased or resold for upcoming events.
 */

/**
 * =================================
 * Public Methods
 * =================================
 */

/**
 * Initializes the Event contract.
 */
export function initialize(details: EventDetails): void {
    assert(!is_initialized(), "Contract is already initialized");

    // @todo improve error message
    assert(
        u128.ge(context.attachedDeposit, MIN_ACCOUNT_BALANCE),
        "MIN_ACCOUNT_BALANCE must be attached to initialize"
    );

    Event.set(new Event(context.sender, details));
}

/****************
 * View Methods
 ****************/

/**
 * Fetches the event object from the contract's storage.
 */
export function get_event(): Event {
    assert_initialized();
    return Event.get();
}

/**
 * Get the event host's account ID.
 */
export function get_host(): AccountId {
    return get_event().get_host();
}

/**
 * Get the account IDs of the cohosts.
 */
export function get_cohosts(): AccountId[] {
    return get_event().get_cohosts();
}

/**
 * Fetches the event details object.
 */
export function get_details(): EventDetails {
    return get_event().details;
}

/**
 * Returns the ticket price in NEAR.
 */
export function get_ticket_price(): u128 {
    return get_event().get_ticket_price();
}

/**
 * Returns the maximum number of tickets for this event.
 */
export function get_max_tickets(): u32 {
    return get_event().get_max_tickets();
}

/**
 * Returns the number of tickets sold.
 */
export function get_tickets_sold(): u32 {
    return get_event().get_tickets_sold();
}

/**
 * Checks if an account id has a ticket.
 * Also returns true for the host, cohosts, and guests.
 */
export function has_ticket(attendee: AccountId): boolean {
    return get_event().has_ticket(attendee);
}

/****************
 * Change Methods
 ****************/

/**
 * Adds a new cohost to the event.
 */
export function add_cohost(cohost: AccountId): void {
    get_event().add_cohost(cohost);
}

/**
 * Adds someone to the guest list.
 */
export function add_guest(guest: AccountId): void {
    get_event().add_guest(guest);
}

/**
 * Removes a cohost from the event.
 */
export function remove_cohost(cohost: AccountId): void {
    get_event().remove_cohost(cohost);
}

/**
 * Removes someone from the guest list.
 */
export function remove_guest(guest: AccountId): void {
    get_event().remove_guest(guest);
}

/**
 * Sets the event details.
 */
export function set_details(details: EventDetails): void {
    get_event().set_details(details);
}

/**
 * Sets the maximum number of tickets that can be sold.
 */
export function set_max_tickets(num: u32): void {
    get_event().set_max_tickets(num);
}

/**
 * Sets the ticket price.
 */
export function set_ticket_price(price: u128): void {
    get_event().set_ticket_price(price);
}

/**
 * Sets the event to public so people can start buying tickets.
 */
export function go_public(): void {
    get_event().go_public();
}

/**
 * Buys a ticket for the event. Can only be called once per account.
 */
export function buy_ticket(): void {
    get_event().buy_ticket();
}

/**
 * Distributes the ticket revenue to the hosts.
 */
export function pay_hosts(): void {
    get_event().pay_hosts();
}

/**
 * =================================
 * Private Methods
 * =================================
 */

/**
 * Whether or not the project has been initialized.
 */
function is_initialized(): bool {
    return storage.hasKey(EVENT_KEY);
}

/**
 * Guard against contract not having been initialized.
 */
function assert_initialized(): void {
    assert(is_initialized(), "Contract must be initialized first.");
}
