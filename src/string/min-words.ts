import {decorator} from "@leyyo/core";
import {Dict} from "@leyyo/common";
import {SD, stringUtils} from "@leyyo/scalar";
import {validatorHub, VD} from "../base";


interface P extends VD.Placeholder {
    words: any;
    minWords: any;
}

interface C extends Dict {
    minWords?: SD.Value<number>;
}

type O = VD.Opt & C;

/**
 * Data must be shorter than or equal to given minWords words
 *
 * Conditions
 * - string
 *
 * Relations
 * - {@link MinItems} - inverse
 */
export function MinWords(minWords?: SD.Value<number>): PropertyDecorator;
export function MinWords(minWords?: SD.Value<number>): ParameterDecorator;
export function MinWords(opt?: O): ParameterDecorator;
export function MinWords(opt?: O): ParameterDecorator;
export function MinWords(v1?: SD.Value<number> | O): PropertyDecorator | ParameterDecorator {
    return (clazz: object, property?: PropertyKey, index?: number) => {
        const ins = deco.fork(clazz, property, index);
        const {opt, constraint} = validatorHub.pool.options<C>(ins, v1, 'minWords', 'number');

        validatorHub.pool.add<C, P, string>({
            ins, opt, constraint,
            error: '{{field}} must be shorter than or equal to {{minWords}} words',
            is: (current) => typeof current === 'string',
            validates: (current, ctx) => {

                const {minWords} = ctx.constraint;
                if (!Number.isInteger(minWords) || minWords < 1) {
                    return true;
                }
                const words = stringUtils.wordCount(current);
                if (words < minWords) {
                    return ctx.failed({minWords, words});
                }

                return true;
            }
        });
    }
}

const deco = decorator.addIdentifier(MinWords, ['field', 'parameter']);
deco.addKeyword('validator', 'ph:field', 'ph:deco', 'ph:current', 'ph:minWords', 'ph:words');