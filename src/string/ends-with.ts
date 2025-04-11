import {decorator} from "@leyyo/core";
import {Dict} from "@leyyo/common";
import {SD} from "@leyyo/scalar";
import {validatorHub, VD} from "../base";


interface P extends VD.Placeholder {
    needle: any;
}

interface C extends Dict {
    needle?: SD.Value<string>;
}

type O = VD.Opt & C;

/**
 * Checks if size exceeds max limit
 *
 * Conditions
 * - string
 *
 * Relations
 * - {@link MinItems} - inverse
 */
export function EndsWith(needle?: SD.Value<string>): PropertyDecorator;
export function EndsWith(needle?: SD.Value<string>): ParameterDecorator;
export function EndsWith(opt?: O): ParameterDecorator;
export function EndsWith(opt?: O): ParameterDecorator;
export function EndsWith(v1?: SD.Value<string> | O): PropertyDecorator | ParameterDecorator {
    return (clazz: object, property?: PropertyKey, index?: number) => {
        const ins = deco.fork(clazz, property, index);
        const {opt, constraint} = validatorHub.pool.options<C>(ins, v1, 'needle', 'string');

        validatorHub.pool.add<C, P, string>({
            ins, opt, constraint,
            error: '{{field}} must end with {{needle}}',
            is: (current) => typeof current === 'string',
            validates: (current, ctx) => {

                const {needle} = ctx.constraint;
                if (!needle || typeof needle !== 'string') {
                    return true;
                }

                if (!current.endsWith(needle)) {
                    return ctx.failed({needle});
                }

                return true;
            }
        });
    }
}

const deco = decorator.addIdentifier(EndsWith, ['field', 'parameter']);
deco.addKeyword('validator', 'ph:field', 'ph:deco', 'ph:current', 'ph:needle');