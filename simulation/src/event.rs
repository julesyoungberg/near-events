use near_sdk::near_bindgen;

pub struct EventDetails {
    pub date: u64,
    pub location: String,
    pub title: String,
    pub description: String,
    pub image_url: String,
}

pub struct Event {
    pub public: bool,
    pub details: EventDetails,
}

#[near_bindgen]
pub struct EventContract {}

impl EventContract {
    pub fn initialize(details: EventDetails) {}

    // pub fn get_event() -> Event {}
    pub fn get_event() {}

    // pub fn get_host() -> String {}
    pub fn get_host() {}

    // pub fn get_cohosts() -> [String] {}
    pub fn get_cohosts() {}

    // pub fn get_details() -> EventDetails {}
    pub fn get_details() {}

    // pub fn get_ticket_price() -> u128 {}
    pub fn get_ticket_price() {}

    // pub fn get_max_tickets() -> u32 {}
    pub fn get_max_tickets() {}

    // pub fn get_tickets_sold() -> u32 {}
    pub fn get_tickets_sold() {}

    // pub fn has_ticket() -> bool {}
    pub fn has_ticket() {}

    pub fn add_cohost(cohost: String) {}

    pub fn add_guest(guest: String) {}

    pub fn remove_cohost(cohost: String) {}

    pub fn remove_guest(guest: String) {}

    pub fn set_details(details: EventDetails) {}

    pub fn set_max_tickets(num: u32) {}

    pub fn set_ticket_price(price: u128) {}

    pub fn go_public() {}

    pub fn buy_ticket() {}

    pub fn pay_hosts() {}
}
