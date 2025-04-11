import {decorator} from "@leyyo/core";
import {Dict} from "@leyyo/common";
import {validatorHub, VD} from "../base";

type P = VD.Placeholder;
type C = Dict;
type O = VD.Opt & C;

/**
 * Data must not be a negative number
 *
 * Conditions
 * - number
 *
 * Relations
 * - {@link IsNegative} - inverse
 * - {@link NotPositive} - positive
 */
export function NotNegative(opt?: O): ParameterDecorator;
export function NotNegative(opt?: O): ParameterDecorator;
export function NotNegative(v1?: O): PropertyDecorator | ParameterDecorator {
    return (clazz: object, property?: PropertyKey, index?: number) => {
        const ins = deco.fork(clazz, property, index);
        const {opt, constraint} = validatorHub.pool.options<C>(ins, v1, 'maxItems', 'number');

        validatorHub.pool.add<C, P, number>({
            ins, opt, constraint,
            error: '{{field}} must not be a negative number',
            is: (current) => typeof current === 'number',
            validates: (current, ctx) => {

                if (current < 0) {
                    return ctx.failed({});
                }

                return true;
            }
        });
    }
}

const deco = decorator.addIdentifier(NotNegative, ['field', 'parameter']);
deco.addKeyword('validator', 'ph:field', 'ph:deco', 'ph:current', 'ph:max');