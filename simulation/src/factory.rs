use near_sdk::near_bindgen;

use crate::{EventContract, EventDetails};

#[near_bindgen]
pub struct FactoryContract {
    pub account_id: String,
}

impl FactoryContract {
    pub fn create_Event(name: String, details: EventDetails) {}

    pub fn on_event_created(name: String) {}

    // pub fn get_event_names() -> [String] {}
    pub fn get_event_names() {}
}
