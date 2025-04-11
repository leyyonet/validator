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
 * Data must be greater than given threshold
 *
 * Conditions
 * - array: size of array
 * - object: key size of object
 *
 * Relations
 * - {@link GreaterThanOrEqualTo} - gte
 * - {@link LessThan} - lt
 * - {@link LessThanOrEqualTo} - ltr
 */
export function GreaterThan(threshold?: SD.Value<BasicEqualityType>): PropertyDecorator;
export function GreaterThan(threshold?: SD.Value<BasicEqualityType>): ParameterDecorator;
export function GreaterThan(opt?: O): ParameterDecorator;
export function GreaterThan(opt?: O): ParameterDecorator;
export function GreaterThan(v1?: SD.Value<BasicEqualityType> | O): PropertyDecorator | ParameterDecorator {
    return (clazz: object, property?: PropertyKey, index?: number) => {
        const ins = deco.fork(clazz, property, index);
        const {opt, constraint} = validatorHub.pool.options<C>(ins, v1, 'threshold', ['number', 'bigint', 'string']);

        validatorHub.pool.add<C, P, BasicEqualityType>({
            ins, opt, constraint,
            error: '{{field}} must be greater than {{threshold}}',
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

                if (!(current > threshold)) {
                    return ctx.failed({threshold});
                }
                return true;
            }
        });
    }
}

const deco = decorator.addIdentifier(GreaterThan, ['field', 'parameter']);
deco.addKeyword('validator', 'ph:field', 'ph:deco', 'ph:current', 'ph:threshold');