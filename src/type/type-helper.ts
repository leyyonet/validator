import {TypeHelperLambda, TypeHelperLike} from "./index-types";
import {errorEnveloper} from "@leyyo/error-enveloper";
import {Fqn} from "@leyyo/core";
import {FQN_PCK} from "../internal";

@Fqn(FQN_PCK)
class TypeHelper implements TypeHelperLike {
    isValid<T>(isWeak: boolean, weakFn: TypeHelperLambda<T>, exactFn: TypeHelperLambda<boolean>): boolean {
        if (isWeak) {
            return errorEnveloper.swallow(() => ![null, undefined].includes(weakFn()), false);
        }
        return exactFn();
    }

    getType(current: any): string {
        const type = typeof current;
        if (type === 'object') {
            if (!type) {
                return 'null';
            }
            return current.constructor ? current.constructor.name : type;
        }
        return type;
    }
}

export const typeHelper: TypeHelperLike = new TypeHelper();