import {Max} from "./max";
import {Min} from "./min";
import {IsDivisibleBy} from "./is-divisible-by";
import {NotDivisibleBy} from "./not-divisible-by";
import {IsEven} from "./is-even";
import {IsOdd} from "./is-odd";
import {IsNegative} from "./is-negative";
import {NotNegative} from "./not-negative";
import {IsPositive} from "./is-positive";
import {NotPositive} from "./not-positive";

export const numberDecorators = [
    IsDivisibleBy, NotDivisibleBy,
    IsEven, IsOdd,
    IsNegative, NotNegative,
    IsPositive, NotPositive,
    Max, Min,
];