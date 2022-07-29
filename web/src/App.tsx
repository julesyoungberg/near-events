import React, { useCallback, useEffect, useState } from "react";
import { Container, Nav } from "react-bootstrap";

import { login, logout as destroy, accountBalance } from "./utils/near";
import Wallet from "./components/Wallet";

import Cover from "./components/utils/Cover";
import coverImg from "./assets/img/sandwich.jpg";
import "./App.css";

function App() {
    const account = window.walletConnection.account();
    const [balance, setBalance] = useState("0");

    const getBalance = useCallback(async () => {
        if (account.accountId) {
            setBalance(await accountBalance());
        }
    }, [account]);

    useEffect(() => {
        getBalance();
    }, [getBalance]);

    if (!account.accountId) {
        return <Cover name="Street Food" login={login} coverImg={coverImg} />;
    }

    return (
        <Container fluid="md">
            <Nav className="justify-content-end pt-3 pb-5">
                <Nav.Item>
                    <Wallet
                        address={account.accountId}
                        amount={balance}
                        symbol="NEAR"
                        destroy={destroy}
                    />
                </Nav.Item>
            </Nav>
        </Container>
    );
}

export default App;
