import React from "react";
import { Spinner } from "react-bootstrap";

export default function Loader() {
    return (
        <div className="d-flex justify-content-center">
            <Spinner animation="border" role="status" className="opacity-25">
                <span className="visually-hidden">Loading...</span>
            </Spinner>
        </div>
    );
}
