import {After} from "./after";
import {Before} from "./before";
import {InRange} from "./in-range";
import {NotInRange} from "./not-in-range";
import {MaxDate} from "./max-date";
import {MinDate} from "./min-date";

export const dateDecorators = [
    After, Before,
    InRange, NotInRange,
    MaxDate, MinDate,
];