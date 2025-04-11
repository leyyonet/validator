import {decorator} from "@leyyo/core";
import {arrayUtils, SD} from "@leyyo/scalar";
import {Dict, is, OneOrMore} from "@leyyo/common";
import {validatorHub, VD} from "../base";

interface P extends VD.Placeholder {
    keys: any;
}

interface C extends Dict {
    keys?: SD.Value<Array<string>>;
}

type O = VD.Opt & C;

/**
 * Checks if object does not contain any of keys
 *
 * Conditions
 * - object
 *
 * Relations
 * - {@link RequiresAny} - inverse
 * - {@link BanKeysEvery} - every
 */
export function BanKeysAny(keys?: SD.Value<OneOrMore<string>>): ClassDecorator;
export function BanKeysAny(keys?: SD.Value<OneOrMore<string>>): PropertyDecorator;
export function BanKeysAny(keys?: SD.Value<OneOrMore<string>>): ParameterDecorator;
export function BanKeysAny(opt?: O): ClassDecorator;
export function BanKeysAny(opt?: O): ParameterDecorator;
export function BanKeysAny(opt?: O): ParameterDecorator;
export function BanKeysAny(v1?: SD.Value<OneOrMore<string>> | O): ClassDecorator | PropertyDecorator | ParameterDecorator {
    return (clazz: object, property?: PropertyKey, index?: number) => {
        const ins = deco.fork(clazz, property, index);
        const {opt, constraint} = validatorHub.pool.options<C>(ins, v1, 'keys', 'array');

        validatorHub.pool.add<C, P, Dict>({
            ins, opt, constraint,
            error: '{{field}} must not contain any of {{keys}} keys',
            is: (current) => is.object(current) && !(current instanceof Set),
            validates: (current, ctx) => {

                const {keys} = ctx.constraint;
                if (Array.isArray(keys) && keys.length > 0) {
                    const existing = current instanceof Map ? Array.from(current.keys()) : Object.keys(current);
                    if (arrayUtils.includes(existing, keys)) {
                        return ctx.failed({keys: keys.join(',')});
                    }
                }

                return true;
            }
        });
    }
}

const deco = decorator.addIdentifier(BanKeysAny, ['class', 'field', 'parameter']);
deco.addKeyword('validator', 'ph:field', 'ph:deco', 'ph:current', 'ph:keys');