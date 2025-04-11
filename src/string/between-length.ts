import {decorator} from "@leyyo/core";
import {Dict} from "@leyyo/common";
import {SD} from "@leyyo/scalar";
import {validatorHub, VD} from "../base";
import {StringLengthTuple} from "./index-types";


interface P extends VD.Placeholder {
    minLength: any;
    maxLength: any;
    length: any;
}

interface C extends Dict {
    range?: SD.Value<StringLengthTuple>;
}

type O = VD.Opt & C;

/**
 * Data length must be between given range
 *
 * Conditions
 * - string
 *
 * Relations
 * - {@link MinItems} - inverse
 */
export function BetweenLength(range?: SD.Value<StringLengthTuple>): PropertyDecorator;
export function BetweenLength(range?: SD.Value<StringLengthTuple>): ParameterDecorator;
export function BetweenLength(opt?: O): ParameterDecorator;
export function BetweenLength(opt?: O): ParameterDecorator;
export function BetweenLength(v1?: SD.Value<StringLengthTuple> | O): PropertyDecorator | ParameterDecorator {
    return (clazz: object, property?: PropertyKey, index?: number) => {
        const ins = deco.fork(clazz, property, index);
        const {opt, constraint} = validatorHub.pool.options<C>(ins, v1, 'range', 'array');

        validatorHub.pool.add<C, P, string>({
            ins, opt, constraint,
            error: '{field} length must be between {minLength} and {maxLength}',
            is: (current) => typeof current === 'string',
            validates: (current, ctx) => {

                const {range} = ctx.constraint;
                // no range
                if (!Array.isArray(range) || range.length !== 2) {
                    return true;
                }
                const [minLength, maxLength] = range;
                if (!Number.isInteger(minLength) || minLength < 1 || !Number.isInteger(maxLength) || maxLength < 1) {
                    return true;
                }
                const length = current.length;
                if (!(length >= minLength && length <= maxLength)) {
                    return ctx.failed({minLength, maxLength, length});
                }

                return true;
            }
        });
    }
}


const deco = decorator.addIdentifier(BetweenLength, ['field', 'parameter']);
deco.addKeyword('validator', 'ph:field', 'ph:deco', 'ph:current', 'ph:minLength', 'ph:maxLength', 'ph:length');