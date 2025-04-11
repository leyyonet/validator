import {decorator} from "@leyyo/core";
import {Dict} from "@leyyo/common";
import {SD} from "@leyyo/scalar";
import {validatorHub, VD} from "../base";
import {CharAtTuple} from "./index-types";

interface P extends VD.Placeholder {
    char?: any;
    index?: any;
}

interface C extends Dict {
    tuple?: SD.Value<CharAtTuple>;
}

type O = VD.Opt & C;

/**
 * Data must contain given char at given index
 *
 * Conditions
 * - string
 *
 * Relations
 * - {@link MinItems} - inverse
 */
export function NotCharAt(tuple?: SD.Value<CharAtTuple>): PropertyDecorator;
export function NotCharAt(tuple?: SD.Value<CharAtTuple>): ParameterDecorator;
export function NotCharAt(opt?: O): ParameterDecorator;
export function NotCharAt(opt?: O): ParameterDecorator;
export function NotCharAt(v1?: SD.Value<CharAtTuple> | O): PropertyDecorator | ParameterDecorator {
    return (clazz: object, property?: PropertyKey, index?: number) => {
        const ins = deco.fork(clazz, property, index);
        const {opt, constraint} = validatorHub.pool.options<C>(ins, v1, 'tuple', 'array');

        validatorHub.pool.add<C, P, string>({
            ins, opt, constraint,
            error: '{field} must not contain {{char}} at {{index}}',
            is: (current) => typeof current === 'string',
            validates: (current, ctx) => {

                const {tuple} = ctx.constraint;
                const [char, index] = tuple;
                if (typeof char !== 'string' || char.length !== 1 || !Number.isInteger(index) && index < 0) {
                    return true;
                }
                if (current.charAt(index) === char) {
                    return ctx.failed({char, index});
                }

                return true;
            }
        });
    }
}

const deco = decorator.addIdentifier(NotCharAt, ['field', 'parameter']);
deco.addKeyword('validator', 'ph:field', 'ph:deco', 'ph:current', 'ph:char', 'ph:index');