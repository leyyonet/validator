import {decorator} from "@leyyo/core";
import {Dict, is} from "@leyyo/common";
import {SD} from "@leyyo/scalar";
import {BasicEqualityType, validatorHub, VD} from "../base";


interface P extends VD.Placeholder {
    threshold: any;
}

interface C extends Dict {
    threshold?: SD.Value<BasicEqualityType>;
}

type O = VD.Opt & C;

/**
 * Checks if size exceeds max limit
 *
 * Conditions
 * - array: size of array
 * - object: key size of object
 *
 * Relations
 * - {@link LessThan} - lt
 * - {@link GreaterThan} - gt
 * - {@link GreaterThanOrEqualTo} - gte
 */
export function LessThanOrEqualTo(threshold?: SD.Value<BasicEqualityType>): PropertyDecorator;
export function LessThanOrEqualTo(threshold?: SD.Value<BasicEqualityType>): ParameterDecorator;
export function LessThanOrEqualTo(opt?: O): ParameterDecorator;
export function LessThanOrEqualTo(opt?: O): ParameterDecorator;
export function LessThanOrEqualTo(v1?: SD.Value<BasicEqualityType> | O): PropertyDecorator | ParameterDecorator {
    return (clazz: object, property?: PropertyKey, index?: number) => {
        const ins = deco.fork(clazz, property, index);
        const {opt, constraint} = validatorHub.pool.options<C>(ins, v1, 'threshold', ['number', 'bigint', 'string']);

        validatorHub.pool.add<C, P, BasicEqualityType>({
            ins, opt, constraint,
            error: '{{field}} must be less than or equal to {{threshold}}',
            is: (current) => is.typeOf(current, 'string', 'number', 'bigint'),
            validates: (current, ctx) => {

                const {threshold} = ctx.constraint;
                // no threshold
                if (is.empty(threshold)) {
                    return true;
                }
                const type = typeof current;
                // not same types
                if (type !== typeof threshold) {
                    return true;
                }

                if (!(current <= threshold)) {
                    return ctx.failed({threshold});
                }
                return true;
            }
        });
    }
}

const deco = decorator.addIdentifier(LessThanOrEqualTo, ['field', 'parameter']);
deco.addKeyword('validator', 'ph:field', 'ph:deco', 'ph:current', 'ph:threshold');
export const LTE = LessThanOrEqualTo;
