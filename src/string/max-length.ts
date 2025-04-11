import {decorator} from "@leyyo/core";
import {Dict} from "@leyyo/common";
import {SD} from "@leyyo/scalar";
import {validatorHub, VD} from "../base";


interface P extends VD.Placeholder {
    length: any;
    maxLength: any;
}

interface C extends Dict {
    maxLength?: SD.Value<number>;
}

type O = VD.Opt & C;

/**
 * Data must be shorter than or equal to given maxLength characters
 *
 * Conditions
 * - string
 *
 * Relations
 * - {@link MinItems} - inverse
 */
export function MaxLength(maxLength?: SD.Value<number>): PropertyDecorator;
export function MaxLength(maxLength?: SD.Value<number>): ParameterDecorator;
export function MaxLength(opt?: O): ParameterDecorator;
export function MaxLength(opt?: O): ParameterDecorator;
export function MaxLength(v1?: SD.Value<number> | O): PropertyDecorator | ParameterDecorator {
    return (clazz: object, property?: PropertyKey, index?: number) => {
        const ins = deco.fork(clazz, property, index);
        const {opt, constraint} = validatorHub.pool.options<C>(ins, v1, 'maxLength', 'number');

        validatorHub.pool.add<C, P, string>({
            ins, opt, constraint,
            error: '{{field}} must be shorter than or equal to {{maxLength}} characters',
            is: (current) => typeof current === 'string',
            validates: (current, ctx) => {

                const {maxLength} = ctx.constraint;
                if (!Number.isInteger(maxLength) || maxLength < 1) {
                    return true;
                }
                const length = current.length;
                if (length > maxLength) {
                    return ctx.failed({maxLength, length});
                }

                return true;
            }
        });
    }
}

const deco = decorator.addIdentifier(MaxLength, ['field', 'parameter']);
deco.addKeyword('validator', 'ph:field', 'ph:deco', 'ph:current', 'ph:maxLength', 'ph:length');