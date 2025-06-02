import {Fqn} from "@leyyo/core";
import {CastClass} from "@leyyo/cast";
import {ValidationHelperLike} from "./index.types";
import {FQN} from "../internal";

@Fqn(FQN)
class ValidationHelper implements ValidationHelperLike {
    isValidType(isWeak: boolean, clazz: CastClass, value: any): boolean {
        if (isWeak) {
            if (typeof clazz.canBe === 'function') {
                return clazz.canBe(value);
            }
            return false;
        }
        if (typeof clazz.exact === 'function') {
            return clazz.exact(value);
        }
        return false;
    }

    getExactType(data: any): string {
        const type = typeof data;
        if (type === 'object') {
            if (!type) {
                return 'null';
            }
            return data.constructor ? data.constructor.name : type;
        }
        return type;
    }
}

export const validationHelper: ValidationHelperLike = new ValidationHelper();
