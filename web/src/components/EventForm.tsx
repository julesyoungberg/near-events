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

const fields = [
    "name",
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
    name: {
        label: "Near Name",
        options: {
            required: true,
            maxLength: 64 - CONTRACT_NAME.length,
            pattern: /^(([a-z\d]+[\-_])*[a-z\d]+)$/,
        },
        errors: {
            pattern: "Lowercase, no spaces, not ending with - or _.",
        },
        inputProps: {
            type: "text",
        },
    },
    title: {
        label: "Title",
        options: {
            required: true,
            pattern: /^[\w\s,\.?!]+$/,
        },
        errors: {
            pattern: "Must be a valid title.",
        },
        inputProps: {
            type: "text",
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
            pattern: /^[\w\s,\.?!]+$/,
        },
        errors: {
            pattern: "Must be a valid location",
        },
        inputProps: {
            type: "text",
        },
    },
    description: {
        label: "Description",
        options: {
            required: true,
            pattern: /^[\w\s,\.?!]+$/,
        },
        errors: {
            pattern: "Must be valid text.",
        },
        inputProps: {
            type: "text",
        },
    },
    imageUrl: {
        label: "Image Url",
        options: {
            pattern: /^(https?:\/\/.*\.(?:png|jpg|jpeg))$/i,
        },
        errors: {
            pattern: "Must be a valid PNG or JPEG image URL.",
        },
        inputProps: {
            type: "url",
        },
    },
} as const;

function resolveErrors(formErrors: any) {
    const errors: Partial<Record<Input, string>> = {};

    for (const field of Object.keys(formErrors) as Input[]) {
        const errorType: string = formErrors[field].type;
        if (errorType === "required") {
            errors[field] = `${config[field].label} is required.`;
        } else if (errorType === "maxLength" && config[field].options?.maxLength) {
            errors[field] = `Maximum length is ${config[field].options?.maxLength} characters.`;
        } else {
            errors[field] = config[field].errors?.[errorType];
        }
    }

    return errors;
}

type Props = {
    onClose: () => void;
    save: (name: string, details: EventDetails) => void;
};

export default function EventForm({ onClose, save }: Props) {
    const { formState, register, handleSubmit } = useForm();

    const onSubmit = (data: any) => console.log(data);

    const errors = resolveErrors(formState.errors);

    return (
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
                    onClick={onClose}
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
    );
}
