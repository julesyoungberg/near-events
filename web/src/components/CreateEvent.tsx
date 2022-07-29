import { useState } from "react";
import {
    Button,
    Modal,
    Form,
    FloatingLabel,
    FormControl,
} from "react-bootstrap";
import { useForm } from "react-hook-form";
import { CONTRACT_NAME } from "../utils/config";

import { EventDetails } from "../utils/event";

type Props = {
    save: (name: string, details: EventDetails) => void;
};

const fields = [
    "eventName",
    "title",
    "date",
    "time",
    "location",
    "description",
    "imageUrl",
] as const;

type Input = typeof fields[number];

type FieldConfig = {
    label: string;
    options?: Record<string, any>;
    inputProps?: Record<string, any>;
    errors?: Record<string, string>;
};

type Config = Record<Input, FieldConfig>;

const config: Config = {
    eventName: {
        label: "Event Name",
        options: {
            required: true,
            maxLength: 64 - CONTRACT_NAME.length,
            pattern: /^(([a-z\d]+[\-_])*[a-z\d]+)$/,
        },
        errors: {
            pattern: "Must be lowercase with no spaces.",
        },
    },
    title: {
        label: "Title",
        options: {
            required: true,
        },
    },
    date: {
        label: "Date",
        options: {
            required: true,
        },
        inputProps: {
            type: "date",
        },
    },
    time: {
        label: "Time",
        options: {
            required: true,
        },
        inputProps: {
            type: "time",
        },
    },
    location: {
        label: "Location",
        options: {
            required: true,
        },
    },
    description: {
        label: "Description",
        options: {
            required: true,
        },
    },
    imageUrl: {
        label: "Image Url",
        options: {},
    },
} as const;

function resolveErrors(formErrors: any) {
    const errors: Partial<Record<Input, string>> = {};

    for (const field of Object.keys(formErrors) as Input[]) {
        const errorType: string = formErrors[field].type;
        if (errorType === "required") {
            errors[field] = `${config[field].label} is required.`;
        } else {
            errors[field] = config[field].errors?.[errorType];
        }
    }

    return errors;
}

export default function CreateEvent({ save }: Props) {
    const { formState, register, handleSubmit } = useForm();

    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const onSubmit = (data: any) => console.log(data);

    console.log(formState);

    const errors = resolveErrors(formState.errors);

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
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <Modal.Body>
                        {fields.map((field: Input) => (
                            <FloatingLabel
                                key={field}
                                controlId={field}
                                label={config[field].label}
                                className="mb-3"
                            >
                                <FormControl
                                    {...register(field, config[field].options)}
                                    {...(config[field].inputProps || {})}
                                />
                                {errors[field] && (
                                    <span className="text-danger">
                                        {errors[field]}
                                    </span>
                                )}
                            </FloatingLabel>
                        ))}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button
                            variant="outline-secondary"
                            onClick={handleClose}
                        >
                            Close
                        </Button>
                        <Button
                            variant="dark"
                            type="submit"
                            formAction="submit"
                        >
                            Save Event
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    );
}
