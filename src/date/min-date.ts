import {decorator} from "@leyyo/core";
import {Dict} from "@leyyo/common";
import {SD} from "@leyyo/scalar";
import {validatorHub, VD} from "../base";


interface P extends VD.Placeholder {
    minDate: any;
}

interface C extends Dict {
    minDate?: SD.Value<Date>;
}

type O = VD.Opt & C;

/**
 * Checks if date is after than min date
 *
 * Conditions
 * - date
 *
 * Relations
 * - {@link MaxDate} - max
 */
export function MinDate(minDate?: SD.Value<Date>): PropertyDecorator;
export function MinDate(minDate?: SD.Value<Date>): ParameterDecorator;
export function MinDate(opt?: O): ParameterDecorator;
export function MinDate(opt?: O): ParameterDecorator;
export function MinDate(v1?: SD.Value<Date> | O): PropertyDecorator | ParameterDecorator {
    return (clazz: object, property?: PropertyKey, index?: number) => {
        const ins = deco.fork(clazz, property, index);
        const {opt, constraint} = validatorHub.pool.options<C>(ins, v1, 'minDate', 'Date');

        validatorHub.pool.add<C, P>({
            ins, opt, constraint,
            error: '{{field}} must be before than {{minDate}}',
            is: (current) => current instanceof Date,
            validates: (current, ctx) => {
                const {minDate} = ctx.constraint;
                if (minDate instanceof Date) {
                    if (current.getTime() < minDate.getTime()) {
                        return ctx.failed({minDate});
                    }
                }
                return true;
            }
        });
    }
}

const deco = decorator.addIdentifier(MinDate, ['field', 'parameter']);
deco.addKeyword('validator', 'ph:field', 'ph:deco', 'ph:current', 'ph:after');