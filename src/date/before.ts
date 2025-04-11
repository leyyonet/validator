import {decorator} from "@leyyo/core";
import {Dict} from "@leyyo/common";
import {dateUtils, moment, SD, TimeAmountTuple, TimeEdgeTuple} from "@leyyo/scalar";
import {validatorHub, VD} from "../base";


interface P extends VD.Placeholder {
    before: any;
}

interface C extends Dict {
    amount?: SD.Value<TimeAmountTuple>;
    edge?: TimeEdgeTuple;
}

type O = VD.Opt & C;

/**
 * Checks if date is before than given amount and edge
 *
 * Conditions
 * - date
 *
 * Relations
 * - {@link After} - after
 */
export function Before(amount?: SD.Value<TimeAmountTuple>): PropertyDecorator;
export function Before(amount?: SD.Value<TimeAmountTuple>): ParameterDecorator;
export function Before(opt?: O): ParameterDecorator;
export function Before(opt?: O): ParameterDecorator;
export function Before(v1?: SD.Value<TimeAmountTuple> | O): PropertyDecorator | ParameterDecorator {
    return (clazz: object, property?: PropertyKey, index?: number) => {
        const ins = deco.fork(clazz, property, index);
        const {opt, constraint} = validatorHub.pool.options<C>(ins, v1, 'amount', 'number');

        validatorHub.pool.add<C, P, Date>({
            ins, opt, constraint,
            error: '{{field}} must be before than {{before}}',
            is: (current) => current instanceof Date,
            validates: (current, ctx) => {
                const {amount, edge} = ctx.constraint;
                const mom = moment();
                dateUtils.runEdge(edge, mom);
                dateUtils.runAmount(amount, mom, -1);
                const before = mom.toDate();
                if (current.getTime() > before.getTime()) {
                    return ctx.failed({before});
                }
                return true;
            }
        });
    }
}

const deco = decorator.addIdentifier(Before, ['field', 'parameter']);
deco.addKeyword('validator', 'ph:field', 'ph:deco', 'ph:current', 'ph:before');