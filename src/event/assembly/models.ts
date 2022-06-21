import {
    context,
    ContractPromiseBatch,
    PersistentSet,
    storage,
    u128,
} from "near-sdk-as";

import { EventDetails } from "../../types";
import { AccountId } from "../../utils";

/**
 * The Ticket class represents a ticket to the event and has one owner;
 *
 * @todo: implement ticket resale.
 */
@nearBindgen
export class Ticket {
    constructor(public owner: AccountId) {}
}

export const EVENT_KEY = "ev";

/**
 * The Event class contains the main business logic of the contract.
 */
@nearBindgen
export class Event {
    private cohosts: PersistentSet<AccountId> = new PersistentSet<AccountId>(
        "ch"
    );
    private tickets: PersistentSet<Ticket> = new PersistentSet<Ticket>("tx");
    private guests: PersistentSet<string> = new PersistentSet<string>("gl");
    private max_tickets: i32 = 0;
    private ticket_price: u128 = new u128(0);
    private ticket_revenue: u128 = new u128(0);
    private paid_out: bool = false;
    public public: bool = false;
    public details: EventDetails;

    constructor(public host: AccountId, details: EventDetails) {
        details.assert_valid();
        this.details = details;
    }

    /**
     * Saves the event to singleton storage.
     */
    static set(e: Event): void {
        storage.set(EVENT_KEY, e);
    }

    /**
     * Fetches the event from singleton storage.
     */
    static get(): Event {
        return storage.getSome<Event>(EVENT_KEY);
    }

    // view methods

    get_host(): AccountId {
        return this.host;
    }

    get_cohosts(): AccountId[] {
        return this.cohosts.values();
    }

    get_details(): EventDetails {
        return this.details;
    }

    get_ticket_price(): u128 {
        return this.ticket_price;
    }

    get_max_tickets(): i32 {
        return this.max_tickets;
    }

    get_tickets_sold(): i32 {
        return this.tickets.size;
    }

    /**
     * Returns true if the accound ID is a host, guest, or a ticket holder.
     */
    has_ticket(attendee: AccountId): boolean {
        if (this.is_guest(attendee)) {
            return true;
        }

        const tickets = this.tickets.values();
        for (let i: i32 = 0; i < tickets.length; i++) {
            if (attendee == tickets[i].owner) {
                return true;
            }
        }

        return false;
    }

    // @todo implement payout

    // change methods

    save(): void {
        Event.set(this);
    }

    add_cohost(cohost: AccountId): void {
        this.assert_host();
        this.assert_upcoming();
        this.cohosts.add(cohost);
        this.save();
    }

    add_guest(guest: AccountId): void {
        this.assert_cohost();
        this.assert_upcoming();
        this.guests.add(guest);
        this.save();
    }

    remove_cohost(cohost: AccountId): void {
        this.assert_host();
        this.assert_upcoming();
        this.cohosts.delete(cohost);
        this.save();
    }

    remove_guest(guest: AccountId): void {
        this.assert_cohost();
        this.assert_upcoming();
        this.guests.delete(guest);
        this.save();
    }

    set_details(details: EventDetails): void {
        this.assert_cohost();
        this.assert_upcoming();
        details.assert_valid();
        this.details = details;
        this.save();
    }

    set_max_tickets(num: u32): void {
        this.assert_cohost();
        this.assert_private();
        this.max_tickets = num;
        this.save();
    }

    set_ticket_price(price: u128): void {
        this.assert_cohost();
        this.assert_private();
        this.ticket_price = price;
        this.save();
    }

    go_public(): void {
        this.assert_cohost();
        this.assert_private();
        this.assert_upcoming();
        this.public = true;
        this.save();
    }

    /**
     * Creates a new ticket owned by the sender, provided
     *  - the event is public and upcoming
     *  - they are not a guest or host
     *  - they have not already bought a ticket
     *  - the tickets have not sold out
     *  - the attendee has deposited the ticket cost
     */
    buy_ticket(): void {
        this.assert_upcoming();
        this.assert_public();
        this.assert_not_guest();
        assert(!this.has_ticket(context.sender), "You already have a ticket");

        if (this.max_tickets > 0) {
            assert(
                this.tickets.size < this.max_tickets,
                "This event is sold out"
            );
        }

        this.assert_paid();
        this.ticket_revenue = u128.add(
            this.ticket_revenue,
            context.attachedDeposit
        );

        this.tickets.add(new Ticket(context.sender));
        this.save();
    }

    /**
     * Distributes revenue from ticket sales evenly among the host and cohosts after the event.
     */
    pay_hosts(): void {
        this.assert_host();
        assert(
            this.details.date < context.blockTimestamp,
            "The event must have passed to pay the hosts"
        );
        assert(
            this.ticket_revenue.toU32() > 0,
            "This event had no ticket revenue"
        );
        assert(!this.paid_out, "The hosts have already been paid");

        const num_hosts = this.cohosts.size + 1;
        const pay_amount = u128.div(this.ticket_revenue, new u128(num_hosts));

        const to_host = ContractPromiseBatch.create(this.host);
        to_host.transfer(pay_amount);

        const cohosts = this.cohosts.values();
        for (let i: i32 = 0; i < cohosts.length; i++) {
            const to_cohost = ContractPromiseBatch.create(cohosts[i]);
            to_cohost.transfer(pay_amount);
        }

        this.paid_out = true;
        this.save();
    }

    // private methods

    private assert_host(): void {
        assert(
            context.sender == this.host,
            "Only the host can perform this action"
        );
    }

    private assert_cohost(): void {
        const sender = context.sender;
        assert(
            sender == this.host || this.cohosts.has(sender),
            "Only one of the hosts can perform this action"
        );
    }

    private is_guest(account: AccountId): bool {
        return (
            account == this.host ||
            this.cohosts.has(account) ||
            this.guests.has(account)
        );
    }

    private assert_not_guest(): void {
        assert(
            !this.is_guest(context.sender),
            "Only someone not attending can perform this action"
        );
    }

    private assert_private(): void {
        assert(
            !this.public,
            "This action can only be done before the event goes public"
        );
    }

    private assert_public(): void {
        assert(this.public, "The event must be public to perform this action");
    }

    private assert_upcoming(): void {
        assert(
            context.blockTimestamp < this.details.date,
            "This action can only be done before the event date"
        );
    }

    private assert_paid(): void {
        assert(
            context.attachedDeposit >= this.ticket_price,
            "You must pay the ticket price"
        );
    }

    private assert_public_or_cohost(): void {
        if (!this.public) {
            this.assert_cohost();
        }
    }
}
