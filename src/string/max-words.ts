import {decorator} from "@leyyo/core";
import {Dict} from "@leyyo/common";
import {SD, stringUtils} from "@leyyo/scalar";
import {validatorHub, VD} from "../base";


interface P extends VD.Placeholder {
    words: any;
    maxWords: any;
}

interface C extends Dict {
    maxWords?: SD.Value<number>;
}

type O = VD.Opt & C;

/**
 * Data must be shorter than or equal to given maxWords words
 *
 * Conditions
 * - string
 *
 * Relations
 * - {@link MinItems} - inverse
 */
export function MaxWords(maxWords?: SD.Value<number>): PropertyDecorator;
export function MaxWords(maxWords?: SD.Value<number>): ParameterDecorator;
export function MaxWords(opt?: O): ParameterDecorator;
export function MaxWords(opt?: O): ParameterDecorator;
export function MaxWords(v1?: SD.Value<number> | O): PropertyDecorator | ParameterDecorator {
    return (clazz: object, property?: PropertyKey, index?: number) => {
        const ins = deco.fork(clazz, property, index);
        const {opt, constraint} = validatorHub.pool.options<C>(ins, v1, 'maxWords', 'number');

        validatorHub.pool.add<C, P, string>({
            ins, opt, constraint,
            error: '{{field}} must be shorter than or equal to {{maxWords}} words',
            is: (current) => typeof current === 'string',
            validates: (current, ctx) => {

                const {maxWords} = ctx.constraint;
                if (!Number.isInteger(maxWords) || maxWords < 1) {
                    return true;
                }
                const words = stringUtils.wordCount(current);
                if (words > maxWords) {
                    return ctx.failed({maxWords, words});
                }

                return true;
            }
        });
    }
}

const deco = decorator.addIdentifier(MaxWords, ['field', 'parameter']);
deco.addKeyword('validator', 'ph:field', 'ph:deco', 'ph:current', 'ph:maxWords', 'ph:words');