import {ContainsAny} from "./contains-any";
import {ContainsEvery} from "./contains-every";
import {MaxItems} from "./max-items";
import {MinItems} from "./min-items";
import {NotContainAny} from "./not-contain-any";
import {NotContainEvery} from "./not-contain-every";
import {NotDuplicated} from "./not-duplicated";
import {BanKeysAny} from "./ban-keys-any";
import {BanKeysEvery} from "./ban-keys-every";
import {RequiresAny} from "./requires-any";
import {RequiresEvery} from "./requires-every";
import {IsInstanceOf} from "./is-instance-of";
import {NotInstanceOf} from "./not-instance-of";

export const objectDecorators = [
    BanKeysAny, BanKeysEvery,
    ContainsAny, ContainsEvery,
    MaxItems, MinItems,
    NotContainAny, NotContainEvery,
    NotDuplicated,
    RequiresAny, RequiresEvery,
    IsInstanceOf, NotInstanceOf,
];