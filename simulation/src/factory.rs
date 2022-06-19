use near_sdk::{near_bindgen, PendingContractTx};

use crate::{EventContract, EventDetails};

#[near_bindgen]
pub struct FactoryContract {
    pub account_id: String,
}

impl FactoryContract {
    pub fn create_event(&self, name: String, details: EventDetails) {}

    pub fn on_event_created(&self, name: String) {}

    // pub fn get_event_names() -> [String] {}
    pub fn get_event_names(&self) {}
}
