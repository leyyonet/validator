import {decorator} from "@leyyo/core";
import {Dict} from "@leyyo/common";
import {validatorHub, VD} from "../base";

type P = VD.Placeholder;
type C = Dict;
type O = VD.Opt & C;

/**
 * Data must be an odd number
 *
 * Conditions
 * - integer
 *
 * Relations
 * - {@link IsEven} - inverse
 */
export function IsOdd(opt?: O): ParameterDecorator;
export function IsOdd(opt?: O): ParameterDecorator;
export function IsOdd(v1?: O): PropertyDecorator | ParameterDecorator {
    return (clazz: object, property?: PropertyKey, index?: number) => {
        const ins = deco.fork(clazz, property, index);
        const {opt, constraint} = validatorHub.pool.options<C>(ins, v1);

        validatorHub.pool.add<C, P, number>({
            ins, opt, constraint,
            error: '{{field}} must be an odd number',
            is: (current) => Number.isInteger(current),
            validates: (current, ctx) => {
                if ((current % 2) === 0) {
                    return ctx.failed({});
                }
                return true;
            }
        });
    }
}

const deco = decorator.addIdentifier(IsOdd, ['field', 'parameter']);
deco.addKeyword('validator', 'ph:field', 'ph:deco', 'ph:current');