import { context, PersistentSet, storage, u128 } from "near-sdk-as";
import { AccountId, Timestamp } from '../../utils';

/**
 * This class contains details about an event including date, location, and a description.
 */
@nearBindgen
export class EventDetails {
    constructor(
        public date: Timestamp,
        public location: string,
        public title: string,
        public description: string,
        public image_url: string,
    ) {}

    assert_valid(): void {
        assert(this.date > context.blockTimestamp, "The date must be upcoming");
        assert(this.location != "", "A location is required");
        assert(this.title != "", "A title is required");
        assert(this.description != "", "A description is required");
    }
}

 /**
  * The Ticket class represents a ticket to the event and has one owner;
  * 
  * @todo: implement ticket resale.
  */
@nearBindgen
export class Ticket {
    constructor(public owner: AccountId) {}
}

export const EVENT_KEY = 'ev';

/**
 * The Event class contains the main business logic of the contract.
 */
@nearBindgen
export class Event {
    private cohosts: PersistentSet<AccountId> = new PersistentSet<AccountId>("ch");
    private tickets: PersistentSet<Ticket> = new PersistentSet<Ticket>("tx");
    private guests: PersistentSet<string> = new PersistentSet<string>("gl");
    private max_tickets: i32 = 0;
    private ticket_price: u128;
    public public: bool = false;
    public date: Timestamp;
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
        this.assert_public_or_cohost();
        return this.host;
    }

    get_cohosts(): AccountId[] {
        this.assert_public_or_cohost();
        return this.cohosts.values();
    }

    get_details(): EventDetails {
        this.assert_public_or_cohost();
        return this.details;
    }

    get_ticket_price(): u128 {
        this.assert_public_or_cohost();
        return this.ticket_price;
    }

    get_max_tickets(): i32 {
        this.assert_public_or_cohost();
        return this.max_tickets;
    }

    get_tickets_sold(): i32 {
        this.assert_cohost();
        return this.tickets.size;
    }

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
        this.cohosts.add(cohost)
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

    buy_ticket(): void {
        this.assert_upcoming();
        this.assert_public();
        this.assert_not_guest();
        assert(!this.has_ticket(context.sender), "You already have a ticket");

        if (this.max_tickets > 0) {
            assert(this.tickets.size < this.max_tickets, "This event is sold out");
        }

        this.assert_paid();
        this.tickets.add(new Ticket(context.sender));
        this.save();
    }

    // private methods

    private assert_host(): void {
        assert(context.sender == this.host, "Only the host can perform this action");
    }

    private assert_cohost(): void {
        const sender = context.sender;
        assert(sender == this.host || this.cohosts.has(sender), "Only one of the hosts can perform this action");
    }

    private is_guest(account: AccountId): bool {
        return account == this.host || this.cohosts.has(account) || this.guests.has(account);
    }

    private assert_not_guest(): void {
        assert(!this.is_guest(context.sender), "Only someone not attending can perform this action");
    }

    private assert_private(): void {
        assert(!this.public, "This action can only be done before the event goes public");
    }

    private assert_public(): void {
        assert(this.public, "The event must be public to perform this action");
    }

    private assert_upcoming(): void {
        assert(context.blockTimestamp < this.details.date, "This action can only be done before the event date");
    }

    private assert_paid(): void {
        assert(context.attachedDeposit >= this.ticket_price, "You must pay the ticket price");
    }

    private assert_public_or_cohost(): void {
        if (!this.public) {
            this.assert_cohost();
        }
    }
}
