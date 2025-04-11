import {decorator} from "@leyyo/core";
import {Dict} from "@leyyo/common";
import {SD} from "@leyyo/scalar";
import {validatorHub, VD} from "../base";

interface P extends VD.Placeholder {
    mod: any;
}

interface C extends Dict {
    mod?: SD.Value<number>;
}

type O = VD.Opt & C;

/**
 * Data must not be divisible by given mod
 *
 * Conditions
 * - integer
 *
 * Relations
 * - {@link IsDivisibleBy} - inverse
 */

export function NotDivisibleBy(mod?: SD.Value<number>): PropertyDecorator;
export function NotDivisibleBy(mod?: SD.Value<number>): ParameterDecorator;
export function NotDivisibleBy(opt?: O): ParameterDecorator;
export function NotDivisibleBy(opt?: O): ParameterDecorator;
export function NotDivisibleBy(v1?: SD.Value<number> | O): PropertyDecorator | ParameterDecorator {
    return (clazz: object, property?: PropertyKey, index?: number) => {
        const ins = deco.fork(clazz, property, index);
        const {opt, constraint} = validatorHub.pool.options<C>(ins, v1, 'mod', 'number');

        validatorHub.pool.add<C, P, number>({
            ins, opt, constraint,
            error: '{{field}} must not be divisible by {{mod}}',
            is: (current) => Number.isInteger(current),
            validates: (current, ctx) => {

                const {mod} = ctx.constraint;
                if (Number.isInteger(mod) && mod !== 0) {
                    if ((current % mod) === 0) {
                        return ctx.failed({mod});
                    }
                }
                return true;
            }
        });
    }
}

const deco = decorator.addIdentifier(NotDivisibleBy, ['field', 'parameter']);
deco.addKeyword('validator', 'ph:field', 'ph:deco', 'ph:current', 'ph:mod');