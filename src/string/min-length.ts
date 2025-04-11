import {decorator} from "@leyyo/core";
import {Dict} from "@leyyo/common";
import {SD} from "@leyyo/scalar";
import {validatorHub, VD} from "../base";


interface P extends VD.Placeholder {
    length: any;
    minLength: any;
}

interface C extends Dict {
    minLength?: SD.Value<number>;
}

type O = VD.Opt & C;

/**
 * Data must be longer than or equal to given minLength characters
 *
 * Conditions
 * - string
 *
 * Relations
 * - {@link MinItems} - inverse
 */
export function MinLength(minLength?: SD.Value<number>): PropertyDecorator;
export function MinLength(minLength?: SD.Value<number>): ParameterDecorator;
export function MinLength(opt?: O): ParameterDecorator;
export function MinLength(opt?: O): ParameterDecorator;
export function MinLength(v1?: SD.Value<number> | O): PropertyDecorator | ParameterDecorator {
    return (clazz: object, property?: PropertyKey, index?: number) => {
        const ins = deco.fork(clazz, property, index);
        const {opt, constraint} = validatorHub.pool.options<C>(ins, v1, 'minLength', 'number');

        validatorHub.pool.add<C, P, string>({
            ins, opt, constraint,
            error: '{{field}} must be longer than or equal to {{minLength}} characters',
            is: (current) => typeof current === 'string',
            validates: (current, ctx) => {

                const {minLength} = ctx.constraint;
                if (!Number.isInteger(minLength) || minLength < 1) {
                    return true;
                }
                const length = current.length;
                if (length < minLength) {
                    return ctx.failed({minLength, length});
                }

                return true;
            }
        });
    }
}


const deco = decorator.addIdentifier(MinLength, ['field', 'parameter']);
deco.addKeyword('validator', 'ph:field', 'ph:deco', 'ph:current', 'ph:minLength', 'ph:length');