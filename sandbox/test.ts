import { strict as assert } from "assert";
import { BN } from "bn.js";
import { promises as fs } from "fs";
import * as nearAPI from "near-api-js";

import { eventDetails } from "../src/__fixtures__/event";

const GAS = "300000000000000";
const ONE_NEAR = nearAPI.utils.format.parseNearAmount("1");

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
    viewMethods: ["get_event_names", "get_block_timestamp"],
    changeMethods: ["create_event"],
};

const eventMethods: ContractMethods = {
    viewMethods: [
        "get_event",
        "get_host",
        "get_cohosts",
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
    console.log("Initializing near");
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
    console.log(
        "Created account",
        account.accountId,
        "with initial balance",
        nearAPI.utils.format.formatNearAmount(
            (await account.getAccountBalance()).available
        )
    );
    return account;
}

function createContractUser(
    userAccountId: nearAPI.Account,
    contractAccountId: string,
    contractMethods: ContractMethods
): any {
    const accountUseContract = new nearAPI.Contract(
        userAccountId,
        contractAccountId,
        contractMethods
    );
    return accountUseContract;
}

async function deployFactory() {
    console.log("Deploying factory contract");
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

    console.log("\nCreating users");
    const host = await createUser("alice");
    const cohost = await createUser("bob");
    const guest = await createUser("carol");
    const attendee = await createUser("david");
    const hostFactoryUser = createContractUser(
        host,
        config.contractAccount,
        factoryMethods
    );

    const startTimestamp = await hostFactoryUser.get_block_timestamp();
    console.log("\nStarting at block timestamp", startTimestamp);

    console.log("\nTests:");
    console.log(" - The contract is initialized with 0 events");
    let eventNames = await hostFactoryUser.get_event_names();
    assert.equal(eventNames.length, 0);

    console.log(" - Events can be created");
    const eventName = "spaceparty";
    await hostFactoryUser.create_event({
        amount: nearAPI.utils.format.parseNearAmount("3"),
        args: {
            name: eventName,
            details: eventDetails,
        },
        gas: GAS,
    });
    eventNames = await hostFactoryUser.get_event_names();
    assert.equal(eventNames.length, 1);
    assert.equal(eventNames[0], eventName);

    const eventAddress = eventName + "." + config.contractAccount;
    const hostEventUser = createContractUser(host, eventAddress, eventMethods);
    const cohostEventUser = createContractUser(
        cohost,
        eventAddress,
        eventMethods
    );
    const guestEventUser = createContractUser(
        guest,
        eventAddress,
        eventMethods
    );
    const attendeeEventUser = createContractUser(
        attendee,
        eventAddress,
        eventMethods
    );

    console.log(" - The event is initialized with 0 cohosts");
    let cohosts = await hostEventUser.get_cohosts();
    assert.equal(cohosts.length, 0);

    console.log(" - The host can add cohosts (", cohost.accountId, ")");
    // assert.equal(await cohostEventUser.has_ticket({ attendee: cohost.accountId }), false);
    await hostEventUser.add_cohost({ args: { cohost: cohost.accountId } });
    cohosts = await hostEventUser.get_cohosts();
    assert.equal(cohosts.length, 1);
    assert.equal(cohosts[0], cohost.accountId);
    // assert.equal(await cohostEventUser.has_ticket({ attendee: cohost.accountId }), true);

    console.log(" - Cohosts can add guests");
    // assert.equal(
    //     await guestEventUser.has_ticket({
    //         args: { attendee: guest.accountId },
    //     }),
    //     false
    // );
    await cohostEventUser.add_guest({ args: { guest: guest.accountId } });
    // assert.equal(
    //     await guestEventUser.has_ticket({
    //         args: { attendee: guest.accountId },
    //     }),
    //     true
    // );

    console.log(" - Hosts can set the ticket price");
    await hostEventUser.set_ticket_price({ args: { price: ONE_NEAR } });

    // console.log(" - Tickets are not purchaseable before the event goes public");
    // assert.throws(async () => {
    //     await attendeeEventUser.buy_ticket();
    // });

    console.log(" - Hosts can make the event public");
    await hostEventUser.go_public({ args: {} });

    console.log(" - Attendees may purchase tickets");
    // assert.equal(
    //     await attendeeEventUser.has_ticket({
    //         args: { attendee: attendee.accountId },
    //     }),
    //     false
    // );
    await attendeeEventUser.buy_ticket({ args: {}, amount: ONE_NEAR });
    // assert.equal(
    //     await attendeeEventUser.has_ticket({
    //         args: { attendee: attendee.accountId },
    //     }),
    //     true
    // );

    console.log(" - Hosts can update the event date");
    /** @todo set the date to the current timestamp or just after */

    console.log(" - Hosts & Cohosts are paid evenly after the event");

    const endTimestamp = await hostFactoryUser.get_block_timestamp();
    console.log("\nEnded at block timestamp", endTimestamp);
}

test();
