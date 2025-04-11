import {decorator} from "@leyyo/core";
import {Dict} from "@leyyo/common";
import {SD} from "@leyyo/scalar";
import {validatorHub, VD} from "../base";
import {CharAtTuple} from "./index-types";


interface P extends VD.Placeholder {
    needle?: any;
    existingIndex?: any;
    index?: any;
}

interface C extends Dict {
    tuple?: SD.Value<CharAtTuple>;
}

type O = VD.Opt & C;

/**
 * Data must not contain given needle at given index
 *
 * Conditions
 * - string
 *
 * Relations
 * - {@link MinItems} - inverse
 */
export function NotIndexOf(tuple?: SD.Value<CharAtTuple>): PropertyDecorator;
export function NotIndexOf(tuple?: SD.Value<CharAtTuple>): ParameterDecorator;
export function NotIndexOf(opt?: O): ParameterDecorator;
export function NotIndexOf(opt?: O): ParameterDecorator;
export function NotIndexOf(v1?: SD.Value<CharAtTuple> | O): PropertyDecorator | ParameterDecorator {
    return (clazz: object, property?: PropertyKey, index?: number) => {
        const ins = deco.fork(clazz, property, index);
        const {opt, constraint} = validatorHub.pool.options<C>(ins, v1, 'tuple', 'array');

        validatorHub.pool.add<C, P, string>({
            ins, opt, constraint,
            error: `{{field}} must not contain {{needle}} at {index}`,
            is: (current) => typeof current === 'string',
            validates: (current, ctx) => {

                const {tuple} = ctx.constraint;
                const [needle, index] = tuple;
                if (typeof needle !== 'string' || needle.length < 1 || !Number.isInteger(index) && index < 0) {
                    return true;
                }
                if (current.indexOf(needle) === index) {
                    return ctx.failed({needle, index});
                }

                return true;
            }
        });
    }
}

const deco = decorator.addIdentifier(NotIndexOf, ['field', 'parameter']);
deco.addKeyword('validator', 'ph:field', 'ph:deco', 'ph:current', 'ph:needle', 'ph:index');