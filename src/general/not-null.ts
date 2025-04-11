import {decorator} from "@leyyo/core";
import {Dict, is} from "@leyyo/common";
import {validatorHub, VD} from "../base";


type P = VD.Placeholder;
type C = Dict;
type O = VD.Opt & C;

/**
 * Data must not be null or undefined
 *
 * Conditions
 * - all
 *
 * Relations
 * - {@link IsNull} - inverse
 */
export function NotNull(opt?: O): ParameterDecorator;
export function NotNull(opt?: O): ParameterDecorator;
export function NotNull(v1?: O): PropertyDecorator | ParameterDecorator {
    return (clazz: object, property?: PropertyKey, index?: number) => {
        const ins = deco.fork(clazz, property, index);
        const {opt, constraint} = validatorHub.pool.options<C>(ins, v1, 'maxItems', 'number');

        validatorHub.pool.add<C, P>({
            ins, opt, constraint,
            error: '{{field}} must not be null or undefined',
            is: (current) => is.empty(current),
            validates: (current, ctx) => {
                return ctx.failed({});
            }
        });
    }
}

const deco = decorator.addIdentifier(NotNull, ['field', 'parameter']);
deco.addKeyword('validator', 'ph:field', 'ph:deco', 'ph:current');