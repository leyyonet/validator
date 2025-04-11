import {decorator} from "@leyyo/core";
import {Dict} from "@leyyo/common";
import {dateUtils, moment, SD, TimeAmountTuple, TimeEdgeTuple} from "@leyyo/scalar";
import {validatorHub, VD} from "../base";


interface P extends VD.Placeholder {
    after?: any;
}

interface C extends Dict {
    amount?: SD.Value<TimeAmountTuple>;
    edge?: TimeEdgeTuple;
}

type O = VD.Opt & C;

/**
 * Checks if date is after than given amount and edge
 *
 * Conditions
 * - date
 *
 * Relations
 * - {@link Before} - before
 */
export function After(amount?: SD.Value<TimeAmountTuple>): PropertyDecorator;
export function After(amount?: SD.Value<TimeAmountTuple>): ParameterDecorator;
export function After(opt?: O): ParameterDecorator;
export function After(opt?: O): ParameterDecorator;
export function After(v1?: SD.Value<TimeAmountTuple> | O): PropertyDecorator | ParameterDecorator {
    return (clazz: object, property?: PropertyKey, index?: number) => {
        const ins = deco.fork(clazz, property, index);
        const {opt, constraint} = validatorHub.pool.options<C>(ins, v1, 'amount', 'array');

        validatorHub.pool.add<C, P, Date>({
            ins, opt, constraint,
            error: '{{field}} must be after than {{after}}',
            is: (current) => current instanceof Date,
            validates: (current, ctx) => {
                const {amount, edge} = ctx.constraint;
                const mom = moment();
                dateUtils.runEdge(edge, mom);
                dateUtils.runAmount(amount, mom, 1);
                const after = mom.toDate();
                if (current.getTime() < after.getTime()) {
                    return ctx.failed({after});
                }
                return true;
            }
        });
    }
}

const deco = decorator.addIdentifier(After, ['field', 'parameter']);
deco.addKeyword('validator', 'ph:field', 'ph:deco', 'ph:current', 'ph:after');