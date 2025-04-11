import {decorator} from "@leyyo/core";
import {Dict} from "@leyyo/common";
import {validatorHub, VD} from "../base";


type P = VD.Placeholder;
type C = Dict;
type O = VD.Opt & C;

/**
 * Data must be an even number
 *
 * Conditions
 * - integer
 *
 * Relations
 * - {@link IsOdd} - inverse
 */
export function IsEven(opt?: O): ParameterDecorator;
export function IsEven(opt?: O): ParameterDecorator;
export function IsEven(v1?: O): PropertyDecorator | ParameterDecorator {
    return (clazz: object, property?: PropertyKey, index?: number) => {
        const ins = deco.fork(clazz, property, index);
        const {opt, constraint} = validatorHub.pool.options<C>(ins, v1);

        validatorHub.pool.add<C, P, number>({
            ins, opt, constraint,
            error: '{{field}} must be an even number',
            is: (current) => Number.isInteger(current),
            validates: (current, ctx) => {
                if ((current % 2) === 1) {
                    return ctx.failed({});
                }
                return true;
            }
        });
    }
}

const deco = decorator.addIdentifier(IsEven, ['field', 'parameter']);
deco.addKeyword('validator', 'ph:field', 'ph:deco', 'ph:current');