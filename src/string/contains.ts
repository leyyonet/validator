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
 * Data must contain given needle
 *
 * Conditions
 * - string
 *
 * Relations
 * - {@link MinItems} - inverse
 */
export function Contains(needle?: SD.Value<string>): PropertyDecorator;
export function Contains(needle?: SD.Value<string>): ParameterDecorator;
export function Contains(opt?: O): ParameterDecorator;
export function Contains(opt?: O): ParameterDecorator;
export function Contains(v1?: SD.Value<string> | O): PropertyDecorator | ParameterDecorator {
    return (clazz: object, property?: PropertyKey, index?: number) => {
        const ins = deco.fork(clazz, property, index);
        const {opt, constraint} = validatorHub.pool.options<C>(ins, v1, 'needle', 'string');

        validatorHub.pool.add<C, P, string>({
            ins, opt, constraint,
            error: '{{field}} must contain {{needle}}',
            is: (current) => typeof current === 'string',
            validates: (current, ctx) => {

                const {needle} = ctx.constraint;
                if (!needle || typeof needle !== 'string') {
                    return true;
                }

                if (!current.includes(needle)) {
                    return ctx.failed({needle});
                }

                return true;
            }
        });
    }
}

const deco = decorator.addIdentifier(Contains, ['field', 'parameter']);
deco.addKeyword('validator', 'ph:field', 'ph:deco', 'ph:current', 'ph:needle');