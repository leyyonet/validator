import {decorator} from "@leyyo/core";
import {arrayUtils, SD} from "@leyyo/scalar";
import {Dict, is} from "@leyyo/common";
import {validatorHub, VD} from "../base";

interface P extends VD.Placeholder {
    keys: any;
}

interface C extends Dict {
    keys?: SD.Value<Array<string>>;
}

type O = VD.Opt & C;

/**
 * Checks if object does not contain every of keys
 *
 * Conditions
 * - object
 *
 * Relations
 * - {@link RequiresEvery} - inverse
 * - {@link BanKeysAny} - any
 */
export function BanKeysEvery(keys?: SD.Value<Array<string>>): ClassDecorator;
export function BanKeysEvery(keys?: SD.Value<Array<string>>): PropertyDecorator;
export function BanKeysEvery(keys?: SD.Value<Array<string>>): ParameterDecorator;
export function BanKeysEvery(opt?: O): ClassDecorator;
export function BanKeysEvery(opt?: O): ParameterDecorator;
export function BanKeysEvery(opt?: O): ParameterDecorator;
export function BanKeysEvery(v1?: SD.Value<Array<string>> | O): ClassDecorator | PropertyDecorator | ParameterDecorator {
    return (clazz: object, property: PropertyKey, index?: number) => {
        const ins = deco.fork(clazz, property, index);
        const {opt, constraint} = validatorHub.pool.options<C>(ins, v1, 'keys', 'array');

        validatorHub.pool.add<C, P, Dict>(
            {
                ins, opt, constraint,
                error: '{{field}} must not contain every of {{keys}} keys',
                is: (current) => is.object(current) && !(current instanceof Set),
                validates: (current, ctx) => {

                    const {keys} = ctx.constraint;
                    if (Array.isArray(keys) && keys.length > 0) {
                        const existing = current instanceof Map ? Array.from(current.keys()) : Object.keys(current);
                        if (arrayUtils.includesEvery(existing, keys)) {
                            return ctx.failed({keys: keys.join(',')});
                        }
                    }

                    return true;
                }
            }
        );
    }
}

const deco = decorator.addIdentifier(BanKeysEvery, ['class', 'field', 'parameter']);
deco.addKeyword('validator', 'ph:field', 'ph:deco', 'ph:current', 'ph:keys');