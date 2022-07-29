import React, { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import { Row } from "react-bootstrap";

import CreateEvent from "./CreateEvent";
import Event from "./Event";
import Loader from "./utils/Loader";
import { SuccessOrErrorNotification } from "./utils/Notifications";
import { createEvent, getEventNames } from "../utils/factory";
import { EventDetails } from "../utils/event";
import useEvents from "../hooks/useEvents";

export function Events() {
    const { data: events, isLoading } = useEvents();

    console.log({ events, isLoading });

    // const createEvent = async (name: string, data: EventDetails) => {
    //     try {
    //         setLoading(true);
    //         createEvent(name, data).then(() => {
    //             getEvents();
    //         });
    //         toast(
    //             <SuccessOrErrorNotification
    //                 text="Product added successfully."
    //                 variant="success"
    //             />
    //         );
    //     } catch (error) {
    //         console.log({ error });
    //         toast(
    //             <SuccessOrErrorNotification
    //                 text="Failed to create a product."
    //                 variant="error"
    //             />
    //         );
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    if (isLoading) {
        return <Loader />;
    }

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="fs-4 fw-bold mb-0">Street Food</h1>
                <CreateEvent save={createEvent} />
            </div>
            <Row xs={1} sm={2} lg={3} className="g-3  mb-5 g-xl-4 g-xxl-5">
                {events.map((event: any) => (
                    <Event
                        event={event}
                        // buy={buy}
                    />
                ))}
            </Row>
        </>
    );
}
