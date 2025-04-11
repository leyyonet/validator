import {decorator} from "@leyyo/core";
import {Dict} from "@leyyo/common";
import {validatorHub, VD} from "../base";


type P = VD.Placeholder;
type C = Dict;
type O = VD.Opt & C;

/**
 * Data must be a negative number
 *
 * Conditions
 * - number
 *
 * Relations
 * - {@link NotNegative} - inverse
 * - {@link IsPositive} - positive
 */
export function IsNegative(opt?: O): ParameterDecorator;
export function IsNegative(opt?: O): ParameterDecorator;
export function IsNegative(v1?: O): PropertyDecorator | ParameterDecorator {
    return (clazz: object, property?: PropertyKey, index?: number) => {
        const ins = deco.fork(clazz, property, index);
        const {opt, constraint} = validatorHub.pool.options<C>(ins, v1);

        validatorHub.pool.add<C, P>({
            ins, opt, constraint,
            error: '{{field}} must be a negative number',
            is: (current) => typeof current === 'number',
            validates: (current, ctx) => {

                if (current >= 0) {
                    return ctx.failed({});
                }

                return true;
            }
        });
    }
}

const deco = decorator.addIdentifier(IsNegative, ['field', 'parameter']);
deco.addKeyword('validator', 'ph:field', 'ph:deco', 'ph:current');