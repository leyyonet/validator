import {decorator} from "@leyyo/core";
import {Dict} from "@leyyo/common";
import {SD} from "@leyyo/scalar";
import {validatorHub, VD} from "../base";


interface P extends VD.Placeholder {
    maxValue: any;
}

interface C extends Dict {
    maxValue?: SD.Value<number>;
}

type O = VD.Opt & C;

/**
 * Data must be greater than or equal to given maxValue
 *
 * Conditions
 * - number
 *
 * Relations
 * - {@link Min} - inverse
 */
export function Max(maxValue?: SD.Value<number>): PropertyDecorator;
export function Max(maxValue?: SD.Value<number>): ParameterDecorator;
export function Max(opt?: O): ParameterDecorator;
export function Max(opt?: O): ParameterDecorator;
export function Max(v1?: SD.Value<number> | O): PropertyDecorator | ParameterDecorator {
    return (clazz: object, property?: PropertyKey, index?: number) => {
        const ins = deco.fork(clazz, property, index);
        const {opt, constraint} = validatorHub.pool.options<C>(ins, v1, 'maxValue', 'number');

        validatorHub.pool.add<C, P, number>({
            ins, opt, constraint,
            error: '{{field}} must be greater than or equal to {{maxValue}}',
            is: (current) => typeof current === 'number',
            validates: (current, ctx) => {

                const {maxValue} = ctx.constraint;
                if (typeof maxValue === 'number' && current > maxValue) {
                    return ctx.failed({maxValue});
                }

                return true;
            }
        });
    }
}

const deco = decorator.addIdentifier(Max, ['field', 'parameter']);
deco.addKeyword('validator', 'ph:field', 'ph:deco', 'ph:current', 'ph:maxValue');