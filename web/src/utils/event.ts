export type EventDetails = {
    date: string;
    location: string;
    title: string;
    description: string;
    image_url: string;
};

export class EventContract {
    constructor(readonly contract: any) {}

    /**
     * View Methods
     */

    getEvent() {
        return this.contract.get_event();
    }

    getHost() {
        return this.contract.get_host();
    }

    getCohosts() {
        return this.contract.get_cohosts();
    }

    getDetails(): EventDetails {
        return this.contract.get_details();
    }

    getTicketPrice() {
        return this.contract.get_ticket_price();
    }

    getTicketsSold() {
        return this.contract.get_tickets_sold();
    }

    /**
     * Change Methods
     */

    addCohost(cohost: string) {
        return this.contract.add_cohost(cohost);
    }

    addGuest(guest: string) {
        return this.contract.add_guest(guest);
    }

    removeCohost(cohost: string) {
        return this.contract.remove_cohost(cohost);
    }

    removeGuest(guest: string) {
        return this.contract.remove_guest(guest);
    }

    setDetails(details: EventDetails) {
        return this.contract.set_details(details);
    }

    setMaxTickets(num: number) {
        return this.contract.set_max_tickets(num);
    }

    setTicketPrice(price: number) {
        return this.contract.set_ticket_price(price);
    }

    goPublic() {
        return this.contract.go_public();
    }

    buyTicket() {
        return this.contract.buy_ticket();
    }

    payHosts() {
        return this.contract.pay_hosts();
    }
}
