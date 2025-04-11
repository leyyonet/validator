import {decorator} from "@leyyo/core";
import {Dict} from "@leyyo/common";
import {SD, stringUtils} from "@leyyo/scalar";
import {validatorHub, VD} from "../base";


interface P extends VD.Placeholder {
    lines: any;
    maxLines: any;
}

interface C extends Dict {
    maxLines?: SD.Value<number>;
}

type O = VD.Opt & C;

/**
 * Data must be shorter than or equal to given maxLines lines
 *
 * Conditions
 * - string
 *
 * Relations
 * - {@link MinItems} - inverse
 */
export function MaxLines(maxLines?: SD.Value<number>): PropertyDecorator;
export function MaxLines(maxLines?: SD.Value<number>): ParameterDecorator;
export function MaxLines(opt?: O): ParameterDecorator;
export function MaxLines(opt?: O): ParameterDecorator;
export function MaxLines(v1?: SD.Value<number> | O): PropertyDecorator | ParameterDecorator {
    return (clazz: object, property?: PropertyKey, index?: number) => {
        const ins = deco.fork(clazz, property, index);
        const {opt, constraint} = validatorHub.pool.options<C>(ins, v1, 'maxLines', 'number');

        validatorHub.pool.add<C, P, string>({
            ins, opt, constraint,
            error: '{{field}} must be shorter than or equal to {{maxLines}} lines',
            is: (current) => typeof current === 'string',
            validates: (current, ctx) => {

                const {maxLines} = ctx.constraint;
                if (!Number.isInteger(maxLines) || maxLines < 1) {
                    return true;
                }
                const lines = stringUtils.lineCount(current);
                if (lines > maxLines) {
                    return ctx.failed({maxLines, lines});
                }

                return true;
            }
        });
    }
}

const deco = decorator.addIdentifier(MaxLines, ['field', 'parameter']);
deco.addKeyword('validator', 'ph:field', 'ph:deco', 'ph:current', 'ph:maxLines', 'ph:lines');