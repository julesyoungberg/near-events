import { EventDetails } from "../../types";
import { AccountId } from "../../utils";

@nearBindgen
export class EventInitializeArgs {
    constructor(
        public details: EventDetails
    ) {}
}

@nearBindgen
export class OnEventCreatedArgs {
    constructor(
        public name: AccountId
    ) {}
}

// @nearBindgen
// export class EventInfo {
//     constructor(
//         public name: AccountId,
//         public details: EventDetails
//     ) {}
// }

// @nearBindgen 
// export class EmptyArgs {
//     constructor() {}
// }
