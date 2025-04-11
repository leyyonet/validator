import {IgnoreValidators} from "./ignore-validators";
import {IsEmpty} from "./is-empty";
import {NotEmpty} from "./not-empty";
import {IsNull} from "./is-null";
import {NotNull} from "./not-null";

export const generalDecorators = [
    IgnoreValidators,
    IsEmpty, NotEmpty,
    IsNull, NotNull,
];