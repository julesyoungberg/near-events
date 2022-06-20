import { strict as assert } from "assert";
import { promises as fs } from "fs";

import * as nearAPI from "near-api-js";
import { BN } from "bn.js";

type Config = {
    networkId: string;
    nodeUrl: string;
    masterAccount: string;
    contractAccount: string;
    keyPath: string;
};

function getConfig(env: string): Config {
    switch (env) {
        case "sandbox":
        case "local":
        default:
            return {
                networkId: "sandbox",
                nodeUrl: "http://localhost:3030",
                masterAccount: "test.near",
                contractAccount: "events.test.near",
                keyPath: "/tmp/near-sandbox/validator_key.json",
            };
    }
}

type ContractMethods = {
    viewMethods: string[];
    changeMethods: string[];
};

const factoryMethods: ContractMethods = {
    viewMethods: ["get_event_names"],
    changeMethods: ["create_event"],
};

const eventMethods: ContractMethods = {
    viewMethods: [
        "get_event",
        "get_host",
        "get_details",
        "get_ticket_price",
        "get_max_tickets",
        "get_tickets_sold",
        "has_ticket",
    ],
    changeMethods: [
        "initialize",
        "add_cohost",
        "add_guest",
        "remove_cohost",
        "remove_guest",
        "set_details",
        "set_max_tickets",
        "set_ticket_price",
        "go_public",
        "buy_ticket",
        "pay_hosts",
    ],
};

let config: Config;
let masterAccount: nearAPI.Account;
let masterKey: nearAPI.utils.KeyPair;
let pubKey: nearAPI.utils.PublicKey;
let keyStore: nearAPI.keyStores.InMemoryKeyStore;
let near: nearAPI.Near;

async function initNear() {
    console.log("initializing near");
    config = getConfig(process.env.NEAR_ENV || "sandbox");
    const keyFile = require(config.keyPath);
    masterKey = nearAPI.utils.KeyPair.fromString(
        keyFile.secret_key || keyFile.private_key
    );
    pubKey = masterKey.getPublicKey();
    keyStore = new nearAPI.keyStores.InMemoryKeyStore();
    keyStore.setKey(config.networkId, config.masterAccount, masterKey);
    near = await nearAPI.connect({
        deps: {
            keyStore,
        },
        networkId: config.networkId,
        nodeUrl: config.nodeUrl,
        headers: {},
    });
    masterAccount = new nearAPI.Account(near.connection, config.masterAccount);
}

async function createUser(accountPrefix: string) {
    let accountId = accountPrefix + "." + config.masterAccount;
    await masterAccount.createAccount(
        accountId,
        pubKey,
        new BN(10).pow(new BN(25))
    );
    keyStore.setKey(config.networkId, accountId, masterKey);
    const account = new nearAPI.Account(near.connection, accountId);
    return account;
}

function createContractUser(
    userAccountId: nearAPI.Account,
    contractAccountId: string,
    contractMethods: ContractMethods,
) {
    const accountUseContract = new nearAPI.Contract(
        userAccountId,
        contractAccountId,
        contractMethods
    );
    return accountUseContract;
}

async function deployFactory() {
    console.log("deploying factory contract");
    const contract = await fs.readFile("./build/debug/factory.wasm");
    await masterAccount.createAndDeployContract(
        config.contractAccount,
        pubKey,
        contract,
        new BN(10).pow(new BN(25))
    );
}

async function test() {
    await initNear();
    await deployFactory();

    const host = await createUser("alice");
    const hostUseFactory = createContractUser(host, config.contractAccount, factoryMethods);

    console.log(" - The contract is initialized with 0 events");
    let eventNames = await (hostUseFactory as any).get_event_names();
    assert.equal(eventNames.length, 0);

}

test();
