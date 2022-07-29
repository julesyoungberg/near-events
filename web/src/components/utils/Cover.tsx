import React from "react";
import { Button } from "react-bootstrap";

interface Props {
    name?: string;
    login: () => void;
    coverImg: string;
}

export default function Cover({ name = "", login, coverImg }: Props) {
    if (!(name && coverImg)) {
        return null;
    }

    return (
        <div
            className="d-flex justify-content-center flex-column text-center"
            style={{ background: "#000", minHeight: "100vh" }}
        >
            <div className="mt-auto text-light mb-5">
                <div
                    className="ratio ratio-1x1 mx-auto mb-2"
                    style={{ maxWidth: "320px" }}
                >
                    <img src={coverImg} />
                </div>
                {name}
                <p>Please connect your wallet to continue</p>
                <Button
                    onClick={login}
                    variant="outline-right"
                    className="rounded-pill px-3 mt-3"
                >
                    Connect Wallet
                </Button>
            </div>
            <p className="mt-auto text-secondary">Powered by NEAR</p>
        </div>
    );
}
