import { VMContext, u128 } from "near-sdk-as";
import * as contract from "../assembly";
import { MIN_ACCOUNT_BALANCE, ONE_NEAR } from "../../utils";
import { EventDetails } from "../assembly/models";

// config
const ONE_MONTH = 30 * 24 * 3600 * 1000 * 1000000; // nanoseconds
const NOW = Date.now() * 1000000; // nanoseconds
const DATE = NOW + ONE_MONTH;
const LOCATION = "space";
const TITLE = "space party";
const DESCRIPTION = "come dance and chat with friends";
const HOST = "alice";
const COHOST = "bob";
const GUEST = "carol";
const ATTENDEE = "david";

// helper functions
const setCurrentAccount = (id: string): void => {
    VMContext.setCurrent_account_id(id);
    VMContext.setSigner_account_id(id);
};

const attachDeposit = (deposit: u128): void => {
    VMContext.setAttached_deposit(deposit);
};

const attachMinBalance = (): void => {
    attachDeposit(MIN_ACCOUNT_BALANCE);
};

const setBlockTimestamp = (timestamp: u64): void => {
    VMContext.setBlock_timestamp(timestamp);
};

const newEventDetails = (): EventDetails =>
    new EventDetails(DATE, LOCATION, TITLE, DESCRIPTION, "");

const doInitialize = (): void => {
    setCurrentAccount(HOST);
    attachMinBalance();
    setBlockTimestamp(NOW);
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

const buyTicket = (): void => {
    setCurrentAccount(ATTENDEE);
    contract.buy_ticket();
    setCurrentAccount(HOST);
};

// tests
describe("initialization", () => {
    it("requires a min deposit", () => {
        expect(() => {
            contract.initialize(newEventDetails());
        }).toThrow();
    });

    test("get_event() requires initialization", () => {
        expect(() => {
            contract.get_event();
        }).toThrow();
    });

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
        });

        describe("detail validation", () => {
            beforeEach(() => {
                setCurrentAccount(HOST);
                attachMinBalance();
                setBlockTimestamp(NOW);
            });

            it("requires an upcoming time", () => {
                expect(() => {
                    contract.initialize(
                        new EventDetails(
                            NOW - ONE_MONTH,
                            LOCATION,
                            TITLE,
                            DESCRIPTION,
                            ""
                        )
                    );
                }).toThrow();
            });

            it("requires a location", () => {
                expect(() => {
                    contract.initialize(
                        new EventDetails(DATE, "", TITLE, DESCRIPTION, "")
                    );
                }).toThrow();
            });

            it("requires a title", () => {
                expect(() => {
                    contract.initialize(
                        new EventDetails(DATE, LOCATION, "", DESCRIPTION, "")
                    );
                }).toThrow();
            });

            it("requires a description", () => {
                expect(() => {
                    contract.initialize(
                        new EventDetails(DATE, LOCATION, TITLE, "", "")
                    );
                }).toThrow();
            });
        });
    });
});

describe("initialized", () => {
    beforeEach(doInitialize);

    describe("get_host()", () => {
        it("returns the host account ID", () => {
            setCurrentAccount(HOST);
            contract.go_public();
            setCurrentAccount(ATTENDEE);
            expect(contract.get_host()).toBe(HOST);
        });

        describe("must be at least cohost if private", () => {
            beforeEach(() => {
                addCohost();
                addGuest();
            });

            describe("when private", () => {
                it("throws for an attendee", () => {
                    setCurrentAccount(ATTENDEE);
                    expect(() => {
                        contract.get_host();
                    }).toThrow();
                });

                it("throws for a guest", () => {
                    setCurrentAccount(GUEST);
                    expect(() => {
                        contract.get_host();
                    }).toThrow();
                });

                it("does not throw for a cohost", () => {
                    setCurrentAccount(COHOST);
                    expect(() => {
                        contract.get_host();
                    }).not.toThrow();
                });

                it("does not throw for a host", () => {
                    setCurrentAccount(HOST);
                    expect(() => {
                        contract.get_host();
                    }).not.toThrow();
                });
            });

            describe("when public", () => {
                beforeEach(() => {
                    contract.go_public();
                });

                it("does not throw for a guest", () => {
                    setCurrentAccount(GUEST);
                    expect(() => {
                        contract.get_host();
                    }).not.toThrow();
                });

                it("does not throw for an attendee", () => {
                    setCurrentAccount(ATTENDEE);
                    expect(() => {
                        contract.get_host();
                    }).not.toThrow();
                });
            });
        });
    });

    describe("get_cohosts()", () => {
        it("returns a list of cohost account IDs", () => {
            expect(contract.get_cohosts().length).toBe(0);
            addCohost();
            expect(contract.get_cohosts()[0]).toBe(COHOST);
        });

        describe("must be at least cohost if private", () => {
            beforeEach(() => {
                addCohost();
                addGuest();
            });

            describe("when private", () => {
                it("throws for an attendee", () => {
                    setCurrentAccount(ATTENDEE);
                    expect(() => {
                        contract.get_cohosts();
                    }).toThrow();
                });

                it("throws for a guest", () => {
                    setCurrentAccount(GUEST);
                    expect(() => {
                        contract.get_cohosts();
                    }).toThrow();
                });

                it("does not throw for a cohost", () => {
                    setCurrentAccount(COHOST);
                    expect(() => {
                        contract.get_cohosts();
                    }).not.toThrow();
                });

                it("does not throw for a host", () => {
                    setCurrentAccount(HOST);
                    expect(() => {
                        contract.get_cohosts();
                    }).not.toThrow();
                });
            });

            describe("when public", () => {
                beforeEach(() => {
                    contract.go_public();
                });

                it("does not throw for a guest", () => {
                    setCurrentAccount(GUEST);
                    expect(() => {
                        contract.get_cohosts();
                    }).not.toThrow();
                });

                it("does not throw for an attendee", () => {
                    setCurrentAccount(ATTENDEE);
                    expect(() => {
                        contract.get_cohosts();
                    }).not.toThrow();
                });
            });
        });
    });

    test("get_details()", () => {
        it("returns the event details", () => {
            const details = contract.get_details();
            expect(details.date).toBe(DATE);
            expect(details.location).toBe(LOCATION);
            expect(details.title).toBe(TITLE);
            expect(details.description).toBe(DESCRIPTION);
            expect(details.image_url).toBe("");
        });

        describe("must be at least cohost if private", () => {
            beforeEach(() => {
                addCohost();
                addGuest();
            });

            describe("when private", () => {
                // @todo fix these tests
                // it("throws for an attendee", () => {
                //     setCurrentAccount(ATTENDEE);
                //     expect(() => {
                //         contract.get_details();
                //     }).toThrow();
                // });

                // it("throws for a guest", () => {
                //     setCurrentAccount(GUEST);
                //     expect(() => {
                //         contract.get_details();
                //     }).toThrow();
                // });

                it("does not throw for a cohost", () => {
                    setCurrentAccount(COHOST);
                    expect(() => {
                        contract.get_details();
                    }).not.toThrow();
                });

                it("does not throw for a host", () => {
                    setCurrentAccount(HOST);
                    expect(() => {
                        contract.get_details();
                    }).not.toThrow();
                });
            });

            describe("when public", () => {
                beforeEach(() => {
                    contract.go_public();
                });

                it("does not throw for a guest", () => {
                    setCurrentAccount(GUEST);
                    expect(() => {
                        contract.get_details();
                    }).not.toThrow();
                });

                it("does not throw for an attendee", () => {
                    setCurrentAccount(ATTENDEE);
                    expect(() => {
                        contract.get_details();
                    }).not.toThrow();
                });
            });
        });
    });

    describe("get_ticket_price()", () => {
        describe("must be at least cohost if private", () => {
            beforeEach(() => {
                addCohost();
                addGuest();
            });

            describe("when private", () => {
                it("throws for an attendee", () => {
                    setCurrentAccount(ATTENDEE);
                    expect(() => {
                        contract.get_ticket_price();
                    }).toThrow();
                });

                it("throws for a guest", () => {
                    setCurrentAccount(GUEST);
                    expect(() => {
                        contract.get_ticket_price();
                    }).toThrow();
                });

                it("does not throw for a cohost", () => {
                    setCurrentAccount(COHOST);
                    expect(() => {
                        contract.get_ticket_price();
                    }).not.toThrow();
                });

                it("does not throw for a host", () => {
                    setCurrentAccount(HOST);
                    expect(() => {
                        contract.get_ticket_price();
                    }).not.toThrow();
                });
            });

            describe("when public", () => {
                beforeEach(() => {
                    contract.go_public();
                });

                it("does not throw for a guest", () => {
                    setCurrentAccount(GUEST);
                    expect(() => {
                        contract.get_ticket_price();
                    }).not.toThrow();
                });

                it("does not throw for an attendee", () => {
                    setCurrentAccount(ATTENDEE);
                    expect(() => {
                        contract.get_ticket_price();
                    }).not.toThrow();
                });
            });
        });
    });

    describe("get_max_tickets()", () => {
        describe("must be at least cohost if private", () => {
            beforeEach(() => {
                addCohost();
                addGuest();
            });

            describe("when private", () => {
                it("throws for an attendee", () => {
                    setCurrentAccount(ATTENDEE);
                    expect(() => {
                        contract.get_max_tickets();
                    }).toThrow();
                });

                it("throws for a guest", () => {
                    setCurrentAccount(GUEST);
                    expect(() => {
                        contract.get_max_tickets();
                    }).toThrow();
                });

                it("does not throw for a cohost", () => {
                    setCurrentAccount(COHOST);
                    expect(() => {
                        contract.get_max_tickets();
                    }).not.toThrow();
                });

                it("does not throw for a host", () => {
                    setCurrentAccount(HOST);
                    expect(() => {
                        contract.get_max_tickets();
                    }).not.toThrow();
                });
            });

            describe("when public", () => {
                beforeEach(() => {
                    contract.go_public();
                });

                it("does not throw for a guest", () => {
                    setCurrentAccount(GUEST);
                    expect(() => {
                        contract.get_max_tickets();
                    }).not.toThrow();
                });

                it("does not throw for an attendee", () => {
                    setCurrentAccount(ATTENDEE);
                    expect(() => {
                        contract.get_max_tickets();
                    }).not.toThrow();
                });
            });
        });
    });

    describe("get_tickets_sold()", () => {
        describe("cohosts and host only", () => {
            beforeEach(() => {
                addGuest();
                addCohost();
                contract.go_public();
            });

            it("throws for an attendee", () => {
                setCurrentAccount(ATTENDEE);
                expect(() => {
                    contract.get_tickets_sold();
                }).toThrow();
            });

            it("throws for a guest", () => {
                setCurrentAccount(GUEST);
                expect(() => {
                    contract.get_tickets_sold();
                }).toThrow();
            });

            it("does not throw for an cohost", () => {
                setCurrentAccount(COHOST);
                expect(() => {
                    contract.get_tickets_sold();
                }).not.toThrow();
            });

            it("does not throw for a host", () => {
                setCurrentAccount(HOST);
                expect(() => {
                    contract.get_tickets_sold();
                }).not.toThrow();
            });
        });
    });

    describe("has_ticket()", () => {
        describe("returns true for guests and hosts", () => {
            beforeEach(() => {
                addCohost();
                addGuest();
                contract.go_public();
            });

            it("returns false for someone without a ticket", () => {
                expect(contract.has_ticket(ATTENDEE)).toBe(false);
            });

            it("returns true for a guest", () => {
                expect(contract.has_ticket(GUEST)).toBe(true);
            });

            it("returns true for a cohost", () => {
                expect(contract.has_ticket(COHOST)).toBe(true);
            });

            it("returns true for a host", () => {
                expect(contract.has_ticket(HOST)).toBe(true);
            });
        });
    });

    describe("add_cohost()", () => {
        describe("host only", () => {
            beforeEach(() => {
                addGuest();
                addCohost();
                contract.go_public();
            });

            it("throws for an attendee", () => {
                setCurrentAccount(ATTENDEE);
                expect(() => {
                    contract.add_cohost(ATTENDEE);
                }).toThrow();
            });

            it("throws for a guest", () => {
                setCurrentAccount(GUEST);
                expect(() => {
                    contract.add_cohost(GUEST);
                }).toThrow();
            });

            it("throws for an cohost", () => {
                setCurrentAccount(COHOST);
                expect(() => {
                    contract.add_cohost(GUEST);
                }).toThrow();
            });

            it("does not throw for a host", () => {
                setCurrentAccount(HOST);
                expect(() => {
                    contract.add_cohost(COHOST);
                }).not.toThrow();
            });
        });

        it("throws after the event has passed", () => {
            setBlockTimestamp(DATE + ONE_MONTH);
            expect(() => {
                contract.add_cohost(COHOST);
            }).toThrow();
        });
    });

    describe("add_guest()", () => {
        describe("cohosts and host only", () => {
            beforeEach(() => {
                addGuest();
                addCohost();
                contract.go_public();
            });

            it("throws for an attendee", () => {
                setCurrentAccount(ATTENDEE);
                expect(() => {
                    contract.add_guest(ATTENDEE);
                }).toThrow();
            });

            it("throws for a guest", () => {
                setCurrentAccount(GUEST);
                expect(() => {
                    contract.add_guest(ATTENDEE);
                }).toThrow();
            });

            it("does not throw for an cohost", () => {
                setCurrentAccount(COHOST);
                expect(() => {
                    contract.add_guest(ATTENDEE);
                }).not.toThrow();
            });

            it("does not throw for a host", () => {
                setCurrentAccount(HOST);
                expect(() => {
                    contract.add_guest(ATTENDEE);
                }).not.toThrow();
            });
        });

        it("throws after the event has passed", () => {
            setBlockTimestamp(DATE + ONE_MONTH);
            expect(() => {
                contract.add_guest(GUEST);
            }).toThrow();
        });
    });

    describe("remove_cohost()", () => {
        it("removes the cohost", () => {
            expect(contract.get_cohosts().length).toBe(0);
            contract.add_cohost(COHOST);
            expect(contract.get_cohosts().length).toBe(1);
            contract.remove_cohost(COHOST);
            expect(contract.get_cohosts().length).toBe(0);
        });

        describe("host only", () => {
            beforeEach(() => {
                addGuest();
                addCohost();
                contract.go_public();
            });

            it("throws for an attendee", () => {
                setCurrentAccount(ATTENDEE);
                expect(() => {
                    contract.remove_cohost(ATTENDEE);
                }).toThrow();
            });

            it("throws for a guest", () => {
                setCurrentAccount(GUEST);
                expect(() => {
                    contract.remove_cohost(GUEST);
                }).toThrow();
            });

            it("throws for an cohost", () => {
                setCurrentAccount(COHOST);
                expect(() => {
                    contract.remove_cohost(GUEST);
                }).toThrow();
            });

            it("does not throw for a host", () => {
                setCurrentAccount(HOST);
                expect(() => {
                    contract.remove_cohost(COHOST);
                }).not.toThrow();
            });
        });

        it("throws after the event has passed", () => {
            addCohost();
            setBlockTimestamp(DATE + ONE_MONTH);
            expect(() => {
                contract.remove_cohost(COHOST);
            }).toThrow();
        });
    });

    describe("remove_guest()", () => {
        it("removes the guest", () => {
            contract.go_public();
            expect(contract.has_ticket(GUEST)).toBe(false);
            addGuest();
            expect(contract.has_ticket(GUEST)).toBe(true);
            contract.remove_guest(GUEST);
            expect(contract.has_ticket(GUEST)).toBe(false);
        });

        describe("cohosts and host only", () => {
            beforeEach(() => {
                addGuest();
                addCohost();
                contract.go_public();
            });

            it("throws for an attendee", () => {
                setCurrentAccount(ATTENDEE);
                expect(() => {
                    contract.remove_guest(GUEST);
                }).toThrow();
            });

            it("throws for a guest", () => {
                setCurrentAccount(GUEST);
                expect(() => {
                    contract.remove_guest(GUEST);
                }).toThrow();
            });

            it("does not throw for a cohost", () => {
                setCurrentAccount(COHOST);
                expect(() => {
                    contract.remove_guest(GUEST);
                }).not.toThrow();
            });

            it("does not throw for a host", () => {
                setCurrentAccount(HOST);
                expect(() => {
                    contract.remove_guest(GUEST);
                }).not.toThrow();
            });
        });

        it("throws after the event has passed", () => {
            addGuest();
            setBlockTimestamp(DATE + ONE_MONTH);
            expect(() => {
                contract.remove_guest(GUEST);
            }).toThrow();
        });
    });

    describe("set_details()", () => {
        it("updates the details", () => {
            const new_location = "earth";
            const new_title = "earth dance";
            const new_description = "earth party";
            const new_image_url = "party.jpeg";

            contract.set_details(
                new EventDetails(
                    DATE,
                    new_location,
                    new_title,
                    new_description,
                    new_image_url
                )
            );

            const details = contract.get_details();

            expect(details.location).toBe(new_location);
            expect(details.title).toBe(new_title);
            expect(details.description).toBe(new_description);
            expect(details.image_url).toBe(new_image_url);
        });

        describe("detail validation", () => {
            it("requires an upcoming time", () => {
                expect(() => {
                    contract.initialize(
                        new EventDetails(
                            NOW - ONE_MONTH,
                            LOCATION,
                            TITLE,
                            DESCRIPTION,
                            ""
                        )
                    );
                }).toThrow();
            });

            it("requires a location", () => {
                expect(() => {
                    contract.set_details(
                        new EventDetails(DATE, "", TITLE, DESCRIPTION, "")
                    );
                }).toThrow();
            });

            it("requires a title", () => {
                expect(() => {
                    contract.set_details(
                        new EventDetails(DATE, LOCATION, "", DESCRIPTION, "")
                    );
                }).toThrow();
            });

            it("requires a description", () => {
                expect(() => {
                    contract.set_details(
                        new EventDetails(DATE, LOCATION, TITLE, "", "")
                    );
                }).toThrow();
            });
        });

        describe("cohosts and host only", () => {
            beforeEach(() => {
                addGuest();
                addCohost();
                contract.go_public();
            });

            it("throws for an attendee", () => {
                setCurrentAccount(ATTENDEE);
                expect(() => {
                    contract.set_details(newEventDetails());
                }).toThrow();
            });

            it("throws for a guest", () => {
                setCurrentAccount(GUEST);
                expect(() => {
                    contract.set_details(newEventDetails());
                }).toThrow();
            });

            it("does not throw for a cohost", () => {
                setCurrentAccount(COHOST);
                expect(() => {
                    contract.set_details(newEventDetails());
                }).not.toThrow();
            });

            it("does not throw for a host", () => {
                setCurrentAccount(HOST);
                expect(() => {
                    contract.set_details(newEventDetails());
                }).not.toThrow();
            });
        });

        it("throws after the event has passed", () => {
            setBlockTimestamp(DATE + ONE_MONTH);
            expect(() => {
                contract.set_details(newEventDetails());
            }).toThrow();
        });
    });

    describe("set_ticket_price()", () => {
        it("updates the ticket price", () => {
            setCurrentAccount(HOST);
            setTicketPrice();
            expect(contract.get_ticket_price()).toBe(ONE_NEAR);
        });

        describe("cohosts and host only", () => {
            beforeEach(() => {
                addGuest();
                addCohost();
            });

            it("throws for an attendee", () => {
                setCurrentAccount(ATTENDEE);
                expect(() => {
                    contract.set_ticket_price(ONE_NEAR);
                }).toThrow();
            });

            it("throws for a guest", () => {
                setCurrentAccount(GUEST);
                expect(() => {
                    contract.set_ticket_price(ONE_NEAR);
                }).toThrow();
            });

            it("does not throw for a cohost", () => {
                setCurrentAccount(COHOST);
                expect(() => {
                    contract.set_ticket_price(ONE_NEAR);
                }).not.toThrow();
            });

            it("does not throw for a host", () => {
                setCurrentAccount(HOST);
                expect(() => {
                    contract.set_ticket_price(ONE_NEAR);
                }).not.toThrow();
            });
        });

        describe("private only", () => {
            beforeEach(() => {
                addGuest();
                addCohost();
                contract.go_public();
            });

            it("throws for a cohost", () => {
                setCurrentAccount(COHOST);
                expect(() => {
                    contract.set_ticket_price(ONE_NEAR);
                }).toThrow();
            });

            it("throws for a host", () => {
                setCurrentAccount(HOST);
                expect(() => {
                    contract.set_ticket_price(ONE_NEAR);
                }).toThrow();
            });
        });
    });

    describe("set_max_tickets()", () => {
        describe("cohosts and host only", () => {
            beforeEach(() => {
                addGuest();
                addCohost();
            });

            it("throws for an attendee", () => {
                setCurrentAccount(ATTENDEE);
                expect(() => {
                    contract.set_max_tickets(100);
                }).toThrow();
            });

            it("throws for a guest", () => {
                setCurrentAccount(GUEST);
                expect(() => {
                    contract.set_max_tickets(100);
                }).toThrow();
            });

            it("does not throw for a cohost", () => {
                setCurrentAccount(COHOST);
                expect(() => {
                    contract.set_max_tickets(100);
                }).not.toThrow();
            });

            it("does not throw for a host", () => {
                setCurrentAccount(HOST);
                expect(() => {
                    contract.set_max_tickets(100);
                }).not.toThrow();
            });
        });

        describe("private only", () => {
            beforeEach(() => {
                addGuest();
                addCohost();
                contract.go_public();
            });

            it("throws for a cohost", () => {
                setCurrentAccount(COHOST);
                expect(() => {
                    contract.set_max_tickets(100);
                }).toThrow();
            });

            it("throws for a host", () => {
                setCurrentAccount(HOST);
                expect(() => {
                    contract.set_max_tickets(100);
                }).toThrow();
            });
        });
    });

    describe("go_public()", () => {
        describe("cohosts and host only", () => {
            beforeEach(() => {
                addGuest();
                addCohost();
            });

            it("throws for an attendee", () => {
                setCurrentAccount(ATTENDEE);
                expect(() => {
                    contract.go_public();
                }).toThrow();
            });

            it("throws for a guest", () => {
                setCurrentAccount(GUEST);
                expect(() => {
                    contract.go_public();
                }).toThrow();
            });

            it("does not throw for a cohost", () => {
                setCurrentAccount(COHOST);
                expect(() => {
                    contract.go_public();
                }).not.toThrow();
            });

            it("does not throw for a host", () => {
                setCurrentAccount(HOST);
                expect(() => {
                    contract.go_public();
                }).not.toThrow();
            });
        });

        describe("private only", () => {
            beforeEach(() => {
                addGuest();
                addCohost();
                contract.go_public();
            });

            it("throws for a cohost", () => {
                setCurrentAccount(COHOST);
                expect(() => {
                    contract.go_public();
                }).toThrow();
            });

            it("throws for a host", () => {
                setCurrentAccount(HOST);
                expect(() => {
                    contract.go_public();
                }).toThrow();
            });
        });

        it("throws after the event has passed", () => {
            setBlockTimestamp(DATE + ONE_MONTH);
            expect(() => {
                contract.go_public();
            }).toThrow();
        });
    });

    describe("buy_ticket()", () => {
        describe("public only", () => {
            beforeEach(() => {
                addGuest();
                addCohost();
            });

            describe("when private", () => {
                it("throws for an attendee", () => {
                    setCurrentAccount(ATTENDEE);
                    expect(() => {
                        contract.buy_ticket();
                    }).toThrow();
                });

                it("throws for a guest", () => {
                    setCurrentAccount(GUEST);
                    expect(() => {
                        contract.buy_ticket();
                    }).toThrow();
                });

                it("throws for a cohost", () => {
                    setCurrentAccount(COHOST);
                    expect(() => {
                        contract.buy_ticket();
                    }).toThrow();
                });

                it("throws for a host", () => {
                    setCurrentAccount(HOST);
                    expect(() => {
                        contract.buy_ticket();
                    }).toThrow();
                });
            });
        });

        describe("attendee only", () => {
            beforeEach(() => {
                addGuest();
                addCohost();
                contract.go_public();
            });

            it("does not throw for an attendee", () => {
                setCurrentAccount(ATTENDEE);
                expect(() => {
                    contract.buy_ticket();
                }).not.toThrow();
            });

            it("throws for a guest", () => {
                setCurrentAccount(GUEST);
                expect(() => {
                    contract.buy_ticket();
                }).toThrow();
            });

            it("throws for a cohost", () => {
                setCurrentAccount(COHOST);
                expect(() => {
                    contract.buy_ticket();
                }).toThrow();
            });

            it("throws for a host", () => {
                setCurrentAccount(HOST);
                expect(() => {
                    contract.buy_ticket();
                }).toThrow();
            });
        });

        it("throws after the event has passed", () => {
            setBlockTimestamp(DATE + ONE_MONTH);
            setCurrentAccount(ATTENDEE);
            expect(() => {
                contract.buy_ticket();
            }).toThrow();
        });
    });

    describe("tickets", () => {
        describe("free and unlimited by default", () => {
            beforeEach(() => {
                contract.go_public();
            });

            it("should be free by default", () => {
                expect(contract.get_ticket_price()).toBe(new u128(0));
            });

            it("should be unlimited by default", () => {
                expect(contract.get_max_tickets()).toBe(0);
            });

            it("should be purchasable", () => {
                attachDeposit(new u128(0));

                setCurrentAccount(HOST);
                expect(contract.get_tickets_sold()).toBe(0);

                setCurrentAccount(ATTENDEE);
                expect(contract.has_ticket(ATTENDEE)).toBe(false);
                contract.buy_ticket();
                expect(contract.has_ticket(ATTENDEE)).toBe(true);

                setCurrentAccount(GUEST);
                expect(contract.has_ticket(GUEST)).toBe(false);
                contract.buy_ticket();
                expect(contract.has_ticket(GUEST)).toBe(true);

                setCurrentAccount(HOST);
                expect(contract.get_tickets_sold()).toBe(2);
            });
        });

        describe("max number and price are configurable", () => {
            beforeEach(() => {
                contract.set_ticket_price(ONE_NEAR);
                contract.set_max_tickets(2);
                contract.go_public();
                setCurrentAccount(ATTENDEE);
            });

            it("should throw without the price", () => {
                setCurrentAccount(HOST);
                expect(contract.get_tickets_sold()).toBe(0);

                setCurrentAccount(ATTENDEE);
                attachDeposit(new u128(0));
                expect(() => {
                    contract.buy_ticket();
                }).toThrow();

                setCurrentAccount(HOST);
                expect(contract.get_tickets_sold()).toBe(0);
            });

            it("should succeed with the correct deposit", () => {
                setCurrentAccount(HOST);
                expect(contract.get_tickets_sold()).toBe(0);

                setCurrentAccount(ATTENDEE);
                expect(contract.has_ticket(ATTENDEE)).toBe(false);
                contract.buy_ticket();
                expect(contract.has_ticket(ATTENDEE)).toBe(true);

                setCurrentAccount(HOST);
                expect(contract.get_tickets_sold()).toBe(1);
            });

            it("should only allow one per person", () => {
                setCurrentAccount(HOST);
                expect(contract.get_tickets_sold()).toBe(0);

                setCurrentAccount(ATTENDEE);
                contract.buy_ticket();
                expect(() => {
                    contract.buy_ticket();
                }).toThrow();

                setCurrentAccount(HOST);
                expect(contract.get_tickets_sold()).toBe(1);
            });

            it("should throw when the tickets are sold out", () => {
                expect(contract.has_ticket(ATTENDEE)).toBe(false);
                contract.buy_ticket();
                expect(contract.has_ticket(ATTENDEE)).toBe(true);

                setCurrentAccount(GUEST);
                expect(contract.has_ticket(GUEST)).toBe(false);
                contract.buy_ticket();
                expect(contract.has_ticket(GUEST)).toBe(true);

                setCurrentAccount(COHOST);
                expect(contract.has_ticket(COHOST)).toBe(false);
                expect(() => {
                    contract.buy_ticket();
                }).toThrow();
                expect(contract.has_ticket(COHOST)).toBe(false);

                setCurrentAccount(HOST);
                expect(contract.get_tickets_sold()).toBe(2);
            });
        });
    });

    describe("pay_hosts()", () => {
        describe("pays the hosts after the event", () => {
            beforeEach(() => {
                contract.add_cohost(COHOST);
                contract.set_ticket_price(ONE_NEAR);
                contract.go_public();
            });

            it("throws if the event is upcoming", () => {
                buyTicket();
                expect(() => {
                    contract.pay_hosts();
                }).toThrow();
            });

            it("throws if no tickets were bought", () => {
                setBlockTimestamp(DATE + ONE_MONTH);
                expect(() => {
                    contract.pay_hosts();
                }).toThrow();
            });

            it("throws if called twice", () => {
                buyTicket();
                setBlockTimestamp(DATE + ONE_MONTH);
                contract.pay_hosts();
                expect(() => {
                    contract.pay_hosts();
                }).toThrow();
            });
        });

        describe("host only", () => {
            beforeEach(() => {
                addGuest();
                addCohost();
                contract.go_public();
                buyTicket();
                setBlockTimestamp(DATE + ONE_MONTH);
            });

            // @todo fix these tests
            // it("throws for an attendee", () => {
            //     setCurrentAccount(ATTENDEE);
            //     expect(() => {
            //         contract.pay_hosts();
            //     }).toThrow();
            // });

            // it("throws for a guest", () => {
            //     setCurrentAccount(GUEST);
            //     expect(() => {
            //         contract.pay_hosts();
            //     }).toThrow();
            // });

            // it("throws for an cohost", () => {
            //     setCurrentAccount(COHOST);
            //     expect(() => {
            //         contract.pay_hosts();
            //     }).toThrow();
            // });

            // it("does not throw for a host", () => {
            //     setCurrentAccount(HOST);
            //     expect(() => {
            //         contract.pay_hosts();
            //     }).not.toThrow();
            // });
        });
    });
});
