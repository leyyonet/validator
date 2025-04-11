import {decorator} from "@leyyo/core";
import {Dict, is} from "@leyyo/common";
import {SD} from "@leyyo/scalar";
import {BetweenTuple, BetWeenType, validatorHub, VD} from "../base";

interface P extends VD.Placeholder {
    min?: any;
    max?: any;
}

interface C extends Dict {
    range?: SD.Value<BetweenTuple>;
}

type O = VD.Opt & C;

/**
 * Data must not be between given range
 *
 * Conditions
 * - number
 * - string
 * - bigint
 * - date
 *
 * Relations
 * - {@link Between} - inverse
 */
export function NotBetween(range?: SD.Value<BetweenTuple>): PropertyDecorator;
export function NotBetween(range?: SD.Value<BetweenTuple>): ParameterDecorator;
export function NotBetween(opt?: O): ParameterDecorator;
export function NotBetween(opt?: O): ParameterDecorator;
export function NotBetween(v1?: SD.Value<BetweenTuple> | O): PropertyDecorator | ParameterDecorator {
    return (clazz: object, property?: PropertyKey, index?: number) => {
        const ins = deco.fork(clazz, property, index);
        const {opt, constraint} = validatorHub.pool.options<C>(ins, v1, 'range', 'array');

        validatorHub.pool.add<C, P, BetWeenType>({
            ins, opt, constraint,
            error: '{{field}} must not be between {{min}} and {{max}}',
            is: (current) => is.typeOf(current, 'string', 'number', 'bigint') || (current instanceof Date),
            validates: (current, ctx) => {

                const {range} = ctx.constraint;
                // no range
                if (!Array.isArray(range) || range.length !== 2) {
                    return true;
                }
                const type = typeof current;
                const min = range[0];
                const max = range[1];

                // not same types
                if (type !== typeof min || type !== typeof max) {
                    return true;
                }
                switch (type) {
                    case "number":
                    case "string":
                    case "bigint":
                        if (current >= min && current <= max) {
                            return ctx.failed({min, max});
                        }
                        return true;
                    case "object":
                        if (![current, min, max].every(item => item instanceof Date)) {
                            return true;
                        }
                        const [curDate, minDate, maxDate] = [current, min, max].map(item => (item as Date).getTime());
                        if (curDate >= minDate && curDate <= maxDate) {
                            return ctx.failed({min, max});
                        }
                        return true;
                    default:
                        return true;
                }
            }
        });
    }
}

const deco = decorator.addIdentifier(NotBetween, ['field', 'parameter']);
deco.addKeyword('validator', 'ph:field', 'ph:deco', 'ph:current', 'ph:min', 'ph:max');