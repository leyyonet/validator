import {Fqn, Loader} from "@leyyo/core";
import {FQN_PCK} from "./internal";

import {generalDecorators} from "./general/loader";
import {numberDecorators} from "./number/loader";
import {objectDecorators} from "./object/loader";
import {primitiveDecorators} from "./primitive/loader";
import {stringDecorators} from "./string/loader";
import {dateDecorators} from "./date/loader";
import {typeDecorators} from "./type/loader";
import {validatorHub} from "./base/validator-hub";

@Loader(
    validatorHub,
    ...dateDecorators,
    ...generalDecorators,
    ...numberDecorators,
    ...objectDecorators,
    ...primitiveDecorators,
    ...stringDecorators,
    ...typeDecorators,
)
@Fqn(FQN_PCK)
export class ValidatorLoader {
}
