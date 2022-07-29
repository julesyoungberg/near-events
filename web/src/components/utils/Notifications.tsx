import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export function Notification() {
    return (
        <ToastContainer
            position="bottom-center"
            autoClose={5000}
            hideProgressBar
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable={false}
            pauseOnHover
        />
    );
}

const variants = {
    success: "bi-check-circle-fill text-success",
    error: "bi-x-circle-fill text-danger",
} as const;

type Props = {
    text?: string;
    variant: keyof typeof variants;
};

export function SuccessOrErrorNotification({ text, variant }: Props) {
    return (
        <div>
            <i className={"bi mx-2 " + variants[variant]} />
            <span className="text-secondary mx-1">{text}</span>
        </div>
    );
}
