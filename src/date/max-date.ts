import {decorator} from "@leyyo/core";
import {Dict} from "@leyyo/common";
import {SD} from "@leyyo/scalar";
import {validatorHub, VD} from "../base";


interface P extends VD.Placeholder {
    maxDate: any;
}

interface C extends Dict {
    maxDate?: SD.Value<Date>;
}

type O = VD.Opt & C;

/**
 * Checks if date is before than max date
 *
 * Conditions
 * - date
 *
 * Relations
 * - {@link MinDate} - min
 */
export function MaxDate(maxDate?: SD.Value<Date>): PropertyDecorator;
export function MaxDate(maxDate?: SD.Value<Date>): ParameterDecorator;
export function MaxDate(opt?: O): ParameterDecorator;
export function MaxDate(opt?: O): ParameterDecorator;
export function MaxDate(v1?: SD.Value<Date> | O): PropertyDecorator | ParameterDecorator {
    return (clazz: object, property?: PropertyKey, index?: number) => {
        const ins = deco.fork(clazz, property, index);
        const {opt, constraint} = validatorHub.pool.options<C>(ins, v1, 'maxDate', 'Date');

        validatorHub.pool.add<C, P, Date>({
            ins, opt, constraint,
            error: '{{field}} must be before than {{maxDate}}',
            is: (current) => current instanceof Date,
            validates: (current, ctx) => {
                const {maxDate} = ctx.constraint;
                if (maxDate instanceof Date) {
                    if (current.getTime() > maxDate.getTime()) {
                        return ctx.failed({maxDate});
                    }
                }
                return true;
            }
        });
    }
}

const deco = decorator.addIdentifier(MaxDate, ['field', 'parameter']);
deco.addKeyword('validator', 'ph:field', 'ph:deco', 'ph:current', 'ph:before');