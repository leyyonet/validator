import {decorator} from "@leyyo/core";
import {Dict} from "@leyyo/common";
import {SD} from "@leyyo/scalar";
import {validatorHub, VD} from "../base";


interface P extends VD.Placeholder {
    minValue: any;
}

interface C extends Dict {
    minValue?: SD.Value<number>;
}

type O = VD.Opt & C;

/**
 * Data must be less than or equal to given minValue
 *
 * Conditions
 * - number
 *
 * Relations
 * - {@link Max} - inverse
 */
export function Min(minValue?: SD.Value<number>): PropertyDecorator;
export function Min(minValue?: SD.Value<number>): ParameterDecorator;
export function Min(opt?: O): ParameterDecorator;
export function Min(opt?: O): ParameterDecorator;
export function Min(v1?: SD.Value<number> | O): PropertyDecorator | ParameterDecorator {
    return (clazz: object, property?: PropertyKey, index?: number) => {
        const ins = deco.fork(clazz, property, index);
        const {opt, constraint} = validatorHub.pool.options<C>(ins, v1, 'minValue', 'number');

        validatorHub.pool.add<C, P, number>({
            ins, opt, constraint,
            error: '{{field}} must be less than or equal to {{minValue}}',
            is: (current) => typeof current === 'number',
            validates: (current, ctx) => {

                const {minValue} = ctx.constraint;
                if (typeof minValue === 'number' && current < minValue) {
                    return ctx.failed({minValue});
                }

                return true;
            }
        });
    }
}

const deco = decorator.addIdentifier(Min, ['field', 'parameter']);
deco.addKeyword('validator', 'ph:field', 'ph:deco', 'ph:current', 'ph:minValue');