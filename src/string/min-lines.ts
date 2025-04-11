import {decorator} from "@leyyo/core";
import {Dict} from "@leyyo/common";
import {SD, stringUtils} from "@leyyo/scalar";
import {validatorHub, VD} from "../base";


interface P extends VD.Placeholder {
    lines: any;
    minLines: any;
}

interface C extends Dict {
    minLines?: SD.Value<number>;
}

type O = VD.Opt & C;

/**
 * Data must be longer than or equal to given minLines lines
 *
 * Conditions
 * - string
 *
 * Relations
 * - {@link MinItems} - inverse
 */
export function MinLines(minLines?: SD.Value<number>): PropertyDecorator;
export function MinLines(minLines?: SD.Value<number>): ParameterDecorator;
export function MinLines(opt?: O): ParameterDecorator;
export function MinLines(opt?: O): ParameterDecorator;
export function MinLines(v1?: SD.Value<number> | O): PropertyDecorator | ParameterDecorator {
    return (clazz: object, property?: PropertyKey, index?: number) => {
        const ins = deco.fork(clazz, property, index);
        const {opt, constraint} = validatorHub.pool.options<C>(ins, v1, 'minLines', 'number');

        validatorHub.pool.add<C, P, string>({
            ins, opt, constraint,
            error: '{{field}} must be longer than or equal to {{minLines}} lines',
            is: (current) => typeof current === 'string',
            validates: (current, ctx) => {

                const {minLines} = ctx.constraint;
                if (!Number.isInteger(minLines) || minLines < 1) {
                    return true;
                }
                const lines = stringUtils.lineCount(current);
                if (lines < minLines) {
                    return ctx.failed({minLines, lines});
                }

                return true;
            }
        });
    }
}

const deco = decorator.addIdentifier(MinLines, ['field', 'parameter']);
deco.addKeyword('validator', 'ph:field', 'ph:deco', 'ph:current', 'ph:minLines', 'ph:lines');