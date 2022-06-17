import { VMContext, u128, VM } from 'near-sdk-as';
import * as contract from '../assembly'
import { MIN_ACCOUNT_BALANCE, ONE_NEAR, toYocto } from '../../utils';
import { EventDetails } from '../assembly/models';

// config
const DATE = Date.now() / 1000 + 30 * 24 * 3600;
const LOCATION = "space";
const TITLE = "space party";
const DESCRIPTION = 'come dance and chat with friends';
const CONTRACT = 'event';
const HOST = 'alice';
const COHOST = 'bob';
const GUEST = 'carol';
const ATTENDEE = 'david';

// helper functions
const setCurrentAccount = (id: string): void => {
    VMContext.setCurrent_account_id(id);
    VMContext.setSigner_account_id(id);
};

const attachDeposit = (deposit: u128): void => {
    VMContext.setAttached_deposit(deposit);
};

const attachMinBalance = (price?: u128): void => {
    attachDeposit(typeof price === "undefined" ? MIN_ACCOUNT_BALANCE : price);
};

const newEventDetails = (): EventDetails => new EventDetails(
    DATE,
    LOCATION,
    TITLE,
    DESCRIPTION,
    ""
);

const doInitialize = (): void => {
    setCurrentAccount(HOST);
    attachMinBalance();
    contract.initialize(newEventDetails());
};

const setTicketPrice = (): void => {
    contract.set_ticket_price(ONE_NEAR);
};

const addCohost = (): void => {
    contract.add_cohost(COHOST);
};

const addGuest = (): void => {
    contract.add_guest(GUEST);
};

// tests
describe("Event", () => {
    it("requires a min deposit", () => {
        expect(() => {
            contract.initialize(newEventDetails());
        }).toThrow();
    });

    test("get_event() requires initialization", () => {
        expect(() => {
            contract.get_event();
        }).toThrow();
    })

    describe("initialize()", () => {
        it("requires a min deposit", () => {
            expect(() => {
                contract.initialize(newEventDetails());
            }).toThrow();
        });

        it("can only be initialized once", () => {
            doInitialize();
            expect(() => {
                contract.initialize(newEventDetails());
            }).toThrow();
        });

        it("works", () => {
            doInitialize();
            const event = contract.get_event();
            expect(event.host).toBe(HOST);
        })

        // @todo test detail validation
    });

    describe("methods", () => {
        beforeEach(doInitialize);

        // helper test case for the .assert_public_or_cohost guard
        const cohostIfPrivate = (f: () => void): void => {
            test("must be at least cohost unless if private", () => {
                addCohost();
                addGuest();

                setCurrentAccount(ATTENDEE);
                expect(f).toThrow();

                setCurrentAccount(GUEST);
                expect(f).toThrow();

                setCurrentAccount(COHOST);
                f();

                setCurrentAccount(HOST);
                f();

                contract.go_public();

                setCurrentAccount(ATTENDEE);
                f();

                setCurrentAccount(GUEST);
                f();
            });
        };

        describe("get_host()", () => {
            cohostIfPrivate(() => contract.get_host());

            it("works", () => {
                expect(contract.get_host()).toBe(HOST);
            });
        });

        describe("get_cohosts()", () => {
            cohostIfPrivate(() => contract.get_cohosts());

            it("works", () => {
                expect(contract.get_cohosts()[0]).toBe(COHOST);
            });
        });

        test("cohosts", () => {
            expect(contract.get_cohosts().length).toBe(0);
            contract.add_cohost(COHOST);
            expect(contract.get_cohosts().length).toBe(1);
            contract.remove_cohost(COHOST);
            expect(contract.get_cohosts().length).toBe(0);
        });

        test("get_details()", () => {
            const details = contract.get_details();
            expect(details.date).toBe(DATE);
            expect(details.location).toBe(LOCATION);
            expect(details.title).toBe(TITLE);
            expect(details.description).toBe(DESCRIPTION);
            expect(details.image_url).toBe("");
        });

        describe("get_ticket_price()", () => {
            cohostIfPrivate(() => contract.get_ticket_price());
        });

        describe("ticket_price", () => {
            it("defaults to 0", () => {            
                setCurrentAccount(GUEST);
                expect(contract.get_ticket_price()).toBe(new u128(0));
            });

            expect(() => {
                setTicketPrice();
            }).toThrow();

            // guests cannot set the ticket price
            contract.add_guest(GUEST);
            setCurrentAccount(GUEST);
            expect(() => {
                setTicketPrice();
            }).toThrow();

            // cohosts can set the ticket price
            contract.add_cohost(COHOST);
            setTicketPrice();
            
            // the host can set the price
            setCurrentAccount(HOST);
            setTicketPrice();
            expect(contract.get_ticket_price()).toBe(ONE_NEAR);
        });

        test("tickets", () => {

        });
    });
});
