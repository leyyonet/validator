import {Fqn, Loader} from "@leyyo/core";
import {FQN_PCK} from "./internal";
import {validatorIgnore} from "./ignore";
import {validatorPool} from "./pool";
import {validatorRun} from "./run";

@Loader(
    validatorIgnore, validatorPool, validatorRun,
)
@Fqn(FQN_PCK)
export class ValidatorLoader {
}
