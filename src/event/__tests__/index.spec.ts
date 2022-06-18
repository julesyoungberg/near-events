import { VMContext, u128, VM } from 'near-sdk-as';
import * as contract from '../assembly'
import { AccountId, MIN_ACCOUNT_BALANCE, ONE_NEAR, toYocto } from '../../utils';
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

const attachMinBalance = (): void => {
    attachDeposit(MIN_ACCOUNT_BALANCE);
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

// @todo test cases for the assert_private guard
// @todo test cases for the assert_public guard
// @todo test cases for the not_guest guard
// @todo test cases for the assert_paid guard

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
        });

        // @todo test detail validation
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
        it("defaults to 0", () => {
            setCurrentAccount(HOST);
            expect(contract.get_ticket_price()).toBe(new u128(0));
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

        describe("event must be public", () => {
            beforeEach(() => {
                addCohost();
                addGuest();
            });

            describe("when private", () => {
                it("throws for an attendee", () => {
                    setCurrentAccount(ATTENDEE);
                    expect(() => {
                        contract.has_ticket(ATTENDEE);
                    }).toThrow();
                });

                it("throws for a guest", () => {
                    setCurrentAccount(GUEST);
                    expect(() => {
                        contract.has_ticket(GUEST);
                    }).toThrow();
                });

                it("throws for an cohost", () => {
                    setCurrentAccount(COHOST);
                    expect(() => {
                        contract.has_ticket(COHOST);
                    }).toThrow();
                });

                it("throws for a host", () => {
                    setCurrentAccount(HOST);
                    expect(() => {
                        contract.has_ticket(HOST);
                    }).toThrow();
                });
            });

            describe("when public", () => {
                beforeEach(() => {
                    contract.go_public();
                });

                it("does not throw for a guest", () => {
                    setCurrentAccount(GUEST);
                    expect(() => {
                        contract.has_ticket(GUEST);
                    }).not.toThrow();
                });
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
    });

    describe("set_details()", () => {
        // @todo test detail validation

        // it("updates the details", () => {

        // });

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
    });

    // describe("buy_ticket()", () => {
    // @todo test public only guard
    // });

    // @todo test ticket purchasing
});
