import {decorator} from "@leyyo/core";
import {Arr, Dict, is} from "@leyyo/common";
import {scalar, SD} from "@leyyo/scalar";
import {validatorHub, VD} from "../base";


interface P extends VD.Placeholder {
    size: number;
    maxItems: number;
}

interface C extends Dict {
    maxItems?: SD.Value<number>;
}

type O = VD.Opt & C;

/**
 * Checks if size insufficient by min limit
 *
 * Conditions
 * - array: size of array
 * - object: key size of object
 *
 * Relations
 * - {@link MaxItems} - inverse
 */
export function MinItems(keys?: SD.Value<number>): ClassDecorator;
export function MinItems(keys?: SD.Value<number>): PropertyDecorator;
export function MinItems(keys?: SD.Value<number>): ParameterDecorator;
export function MinItems(opt?: O): ClassDecorator;
export function MinItems(opt?: O): ParameterDecorator;
export function MinItems(opt?: O): ParameterDecorator;
export function MinItems(v1?: SD.Value<number> | O): ClassDecorator | PropertyDecorator | ParameterDecorator {
    return (clazz: object, property?: PropertyKey, index?: number) => {
        const ins = deco.fork(clazz, property, index);
        const {opt, constraint} = validatorHub.pool.options<C>(ins, v1, 'maxItems', 'number');

        validatorHub.pool.add<C, P, Arr | Dict>({
            ins, opt, constraint,
            error: '{{field}} must contain at least {{minItems}} elements, but its size: {{size}}',
            is: (current) => is.object(current) && Array.isArray(current),
            validates: (current, ctx) => {

                const {maxItems} = ctx.constraint;
                const size = scalar.size(current);
                if (size > 0 && size < maxItems) {
                    return ctx.failed({size, maxItems});
                }

                return true;
            }
        });
    }
}

const deco = decorator.addIdentifier(MinItems, ['field', 'parameter']);
deco.addKeyword('validator', 'ph:field', 'ph:deco', 'ph:current', 'ph:size', 'ph:minItems');