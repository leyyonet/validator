import {decorator} from "@leyyo/core";
import {Dict, is} from "@leyyo/common";
import {scalar} from "@leyyo/scalar";
import {validatorHub, VD} from "../base";


type P = VD.Placeholder;
type C = Dict;
type O = VD.Opt & C;

/**
 * Data must not be empty
 *
 * Conditions
 * - all: not null and not undefined
 * - array: length > 0
 * - object: size > 0
 * - string: length > 0
 *
 * Relations
 * - {@link IsEmpty} - inverse
 */
export function NotEmpty(opt?: O): ParameterDecorator;
export function NotEmpty(opt?: O): ParameterDecorator;
export function NotEmpty(v1?: O): PropertyDecorator | ParameterDecorator {
    return (clazz: object, property?: PropertyKey, index?: number) => {
        const ins = deco.fork(clazz, property, index);
        const {opt, constraint} = validatorHub.pool.options<C>(ins, v1);

        validatorHub.pool.add<C, P>({
            ins, opt, constraint,
            error: '{field} must not be empty',
            is: (current) => true,
            validates: (current, ctx) => {

                if (is.empty(current)) {
                    return ctx.failed({});
                }
                switch (typeof current) {
                    case "object":
                        if (scalar.size(current) < 1) {
                            return ctx.failed({});
                        }
                        break;
                    case "string":
                        if (!current.trim()) {
                            return ctx.failed({});
                        }
                }

                return true;
            }
        });
    }
}


const deco = decorator.addIdentifier(NotEmpty, ['field', 'parameter']);
deco.addKeyword('validator', 'ph:field', 'ph:deco', 'ph:current');