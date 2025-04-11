import {decorator} from "@leyyo/core";
import {Dict, is} from "@leyyo/common";
import {validatorHub, VD} from "../base";


type P = VD.Placeholder;
type C = Dict;
type O = VD.Opt & C;

/**
 * Data must be null or undefined
 *
 * Conditions
 * - all
 *
 * Relations
 * - {@link NotNull} - inverse
 */
export function IsNull(opt?: O): ParameterDecorator;
export function IsNull(opt?: O): ParameterDecorator;
export function IsNull(v1?: O): PropertyDecorator | ParameterDecorator {
    return (clazz: object, property?: PropertyKey, index?: number) => {
        const ins = deco.fork(clazz, property, index);
        const {opt, constraint} = validatorHub.pool.options<C>(ins, v1, 'maxItems', 'number');

        validatorHub.pool.add<C, P>({
            ins, opt, constraint,
            error: '{{field}} must be null or undefined',
            is: (current) => !is.empty(current),
            validates: (current, ctx) => {
                return ctx.failed({});
            }
        });
    }
}

const deco = decorator.addIdentifier(IsNull, ['field', 'parameter']);
deco.addKeyword('validator', 'ph:field', 'ph:deco', 'ph:current');