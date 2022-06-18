import { context } from "near-sdk-as";
import { Timestamp } from "./utils";

/**
 * This class contains details about an event including date, location, and a description.
 */
@nearBindgen
export class EventDetails {
    constructor(
        public date: Timestamp,
        public location: string,
        public title: string,
        public description: string,
        public image_url: string
    ) {}

    assert_valid(): void {
        assert(this.date > context.blockTimestamp, "The date must be upcoming");
        assert(this.location != "", "A location is required");
        assert(this.title != "", "A title is required");
        assert(this.description != "", "A description is required");
    }
}
