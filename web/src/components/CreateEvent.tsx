import { useState } from "react";
import {
    Button,
    Modal,
} from "react-bootstrap";

import { EventDetails } from "../utils/event";
import EventForm from "./EventForm";

type Props = {
    save: (name: string, details: EventDetails) => void;
};

export default function CreateEvent({ save }: Props) {
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    return (
        <>
            <Button
                onClick={handleShow}
                variant="dark"
                className="rounded-pill px-0"
                style={{ width: "38px" }}
            >
                <i className="bi bi-plus"></i>
            </Button>
            <Modal show={show} onHide={handleClose} centered>
                <Modal.Header closeButton>
                    <Modal.Title>New Event</Modal.Title>
                </Modal.Header>
                <EventForm onClose={handleClose} save={save} />
            </Modal>
        </>
    );
}
