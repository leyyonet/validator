import {decorator} from "@leyyo/core";
import {Dict} from "@leyyo/common";
import {SD} from "@leyyo/scalar";
import {validatorHub, VD} from "../base";
import {CharAtTuple} from "./index-types";

interface P extends VD.Placeholder {
    char?: any;
    existingChar?: any;
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
export function CharAt(tuple?: SD.Value<CharAtTuple>): PropertyDecorator;
export function CharAt(tuple?: SD.Value<CharAtTuple>): ParameterDecorator;
export function CharAt(opt?: O): ParameterDecorator;
export function CharAt(opt?: O): ParameterDecorator;
export function CharAt(v1?: SD.Value<CharAtTuple> | O): PropertyDecorator | ParameterDecorator {
    return (clazz: object, property?: PropertyKey, index?: number) => {
        const ins = deco.fork(clazz, property, index);
        const {opt, constraint} = validatorHub.pool.options<C>(ins, v1, 'tuple', 'array');

        validatorHub.pool.add<C, P, string>({
            ins, opt, constraint,
            error: '{field} must contain {{char}} at {{index}}, but {{existingChar}} is there',
            is: (current) => typeof current === 'string',
            validates: (current, ctx) => {

                const {tuple} = ctx.constraint;
                const [char, index] = tuple;
                if (typeof char !== 'string' || char.length !== 1 || !Number.isInteger(index) && index < 0) {
                    return true;
                }
                const existingChar = current.charAt(index);
                if (existingChar !== char) {
                    return ctx.failed({char, existingChar, index});
                }

                return true;
            }
        });
    }
}

const deco = decorator.addIdentifier(CharAt, ['field', 'parameter']);
deco.addKeyword('validator', 'ph:field', 'ph:deco', 'ph:current', 'ph:char', 'ph:index', 'ph:existingChar');