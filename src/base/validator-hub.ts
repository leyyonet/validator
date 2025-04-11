import {ValidatorHubLike, ValidatorIgnoreLike, ValidatorPoolLike, ValidatorRunLike} from "./index-types";
import {ValidatorIgnore} from "./validator-ignore";
import {ValidatorPool} from "./validator-pool";
import {ValidatorRun} from "./validator-run";
import {Fqn} from "@leyyo/core";
import {FQN_PCK} from "../internal";

@Fqn(FQN_PCK)
class ValidatorHub implements ValidatorHubLike {
    readonly ignore: ValidatorIgnoreLike;
    readonly pool: ValidatorPoolLike;
    readonly run: ValidatorRunLike;

    constructor() {
        this.ignore = new ValidatorIgnore(this);
        this.pool = new ValidatorPool(this);
        this.run = new ValidatorRun(this);
    }
}

export const validatorHub: ValidatorHubLike = new ValidatorHub();