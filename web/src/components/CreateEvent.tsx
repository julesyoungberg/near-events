import { useState } from "react";
import { Button, Modal, Form, FloatingLabel, FormControl } from "react-bootstrap";
import { useForm } from "react-hook-form";

import { EventDetails } from "../utils/event";

type Props = {
    save: (name: string, details: EventDetails) => void;
}

export default function CreateEvent({ save }: Props) {
    const { register, handleSubmit } = useForm();

    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const onSubmit = (data: any) => console.log(data);

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
                    <Modal.Title>New Product</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <Modal.Body>
                        <FloatingLabel
                            controlId="eventName"
                            label="Event Name"
                            className="mb-3"
                        >
                            <FormControl {...register("eventName", { required: true })} />
                        </FloatingLabel>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="outline-secondary" onClick={handleClose}>
                            Close
                        </Button>
                        <Button
                            variant="dark"
                            type="submit"
                        >
                            Save Event
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    );
}
