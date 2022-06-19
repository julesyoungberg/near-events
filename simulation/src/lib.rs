// based on: https://github.com/Learn-NEAR/NCD.L1.sample--nearly-neighbors/blob/main/simulation/src/lib.rs
#![allow(dead_code, unused_variables, unused_imports, non_snake_case)]
use lazy_static::lazy_static;

use chrono;
mod event;
mod factory;

pub use event::*;
pub use factory::*;

#[cfg(test)]
mod test {
    use near_sdk::{json_types::Base58PublicKey, serde_json::json}; //, U128};
    use near_sdk_sim::near_crypto::{InMemorySigner, KeyType};
    use std::convert::TryInto;

    use super::*;
    use near_sdk_sim::{call, deploy, init_simulator, to_yocto, ContractAccount, UserAccount};

    // Load in contract bytes
    lazy_static! {
        static ref FACTORY_WASM_BYTES: &'static [u8] =
            include_bytes!("../../build/debug/factory.wasm").as_ref();
        static ref EVENT_WASM_BYTES: &'static [u8] =
            include_bytes!("../../build/debug/event.wasm").as_ref();
    }

    fn init() -> (UserAccount, ContractAccount<FactoryContract>) {
        let master_account = init_simulator(None);

        let factory_contract = deploy!(
            contract: FactoryContract,
            contract_id: "events",
            bytes: &FACTORY_WASM_BYTES,
            signer_account: master_account
        );

        (master_account, factory_contract)
    }

    fn new_event_details() -> EventDetails {
        EventDetails {
            date: chrono::offset::Utc::now().timestamp() as u64 * 1000 * 1000000,
            location: "space".to_owned(),
            title: "space party".to_owned(),
            description: "come dance and chat with friends".to_owned(),
            image_url: "".to_owned(),
        }
    }

    #[test]
    fn test_create_event() {
        let (master_account, factory) = init();
    }
}
