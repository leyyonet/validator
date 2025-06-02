import {Fqn} from "@leyyo/core";
import {Loader} from "@leyyo/injection";
import {FQN} from "./internal";
import {validatorIgnore} from "./ignore";
import {validatorPool} from "./pool";
import {validatorRun} from "./run";

@Loader(
    validatorIgnore, validatorPool, validatorRun,
)
@Fqn(FQN)
export class ValidatorLoader {
}
