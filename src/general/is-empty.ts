import {decorator} from "@leyyo/core";
import {Dict, is} from "@leyyo/common";
import {scalar} from "@leyyo/scalar";
import {validatorHub, VD} from "../base";


interface P extends VD.Placeholder {
    size: any;
}

type C = Dict;

type O = VD.Opt & C;

/**
 * Data must be empty
 *
 * Conditions
 * - array: zero size
 * - object: zero size
 * - string: zero length
 *
 * Relations
 * - {@link NotEmpty} - inverse
 */
export function IsEmpty(opt?: O): ParameterDecorator;
export function IsEmpty(opt?: O): ParameterDecorator;
export function IsEmpty(v1?: O): PropertyDecorator | ParameterDecorator {
    return (clazz: object, property?: PropertyKey, index?: number) => {
        const ins = deco.fork(clazz, property, index);
        const {opt, constraint} = validatorHub.pool.options<C>(ins, v1);

        validatorHub.pool.add<C, P>({
            ins, opt, constraint,
            error: '{field} must be empty, but it is filled',
            is: (current) => !is.empty(current) && is.typeOf(current, 'string', 'object'),
            validates: (current, ctx) => {
                switch (typeof current) {
                    case "object":
                        const size = scalar.size(current);
                        if (size > 0) {
                            return ctx.failed({size});
                        }
                        break;
                    case "string":
                        if (current.trim()) {
                            return ctx.failed({size: current.length});
                        }
                        break;
                }
                return true;
            }
        });
    }
}

const deco = decorator.addIdentifier(IsEmpty, ['field', 'parameter']);
deco.addKeyword('validator', 'ph:field', 'ph:deco', 'ph:current', 'ph-size');