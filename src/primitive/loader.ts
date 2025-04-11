import {Equals} from "./equals";
import {NotEqual} from "./not-equal";
import {IsIn} from "./is-in";
import {NotIn} from "./not-in";
import {Between, IsBetween} from "./between";
import {NotBetween} from "./not-between";
import {GreaterThan} from "./greater-than";
import {GreaterThanOrEqualTo, GTE} from "./greater-than-or-equal-to";
import {LessThan} from "./less-than";
import {LessThanOrEqualTo, LTE} from "./less-than-or-equal-to";

export const primitiveDecorators = [
    Between, NotBetween, IsBetween,
    Equals, NotEqual,
    GreaterThan, GreaterThanOrEqualTo, GTE,
    IsIn, NotIn,
    LessThan, LessThanOrEqualTo, LTE,
];