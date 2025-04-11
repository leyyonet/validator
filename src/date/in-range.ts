import {decorator} from "@leyyo/core";
import {Dict} from "@leyyo/common";
import {dateUtils, moment, SD, TimePresentItems, TimePresentTuple} from "@leyyo/scalar";
import {validatorHub, VD} from "../base";


interface P extends VD.Placeholder {
    produced?: number;
    equality?: string;
    comparison?: string;
    reason?: string;
}

interface C extends Dict {
    condition?: SD.Value<TimePresentTuple>;
}

type O = VD.Opt & C;

/**
 * Checks if date is passed by given condition
 *
 * Conditions
 * - date
 *
 * Relations
 * - {@link NotInRange} - inverse
 */
export function InRange(condition?: SD.Value<TimePresentTuple>): PropertyDecorator;
export function InRange(condition?: SD.Value<TimePresentTuple>): ParameterDecorator;
export function InRange(opt?: O): ParameterDecorator;
export function InRange(opt?: O): ParameterDecorator;
export function InRange(v1?: SD.Value<TimePresentTuple> | O): PropertyDecorator | ParameterDecorator {
    return (clazz: object, property?: PropertyKey, index?: number) => {
        const ins = deco.fork(clazz, property, index);
        const {opt, constraint} = validatorHub.pool.options<C>(ins, v1, 'condition', 'array');

        validatorHub.pool.add<C, P, Date>({
            ins, opt, constraint,
            error: '{{field}} must be passed by {{equality}}({{produced}},{{comparison}}), reason: {{reason}}',
            is: (current) => current instanceof Date,
            validates: (current, ctx) => {
                const {condition} = ctx.constraint;
                // invalid condition
                if (!Array.isArray(condition) || condition.length !== 2) {
                    return true;
                }
                // invalid present
                if (!TimePresentItems.includes(condition[0])) {
                    return true;
                }

                const mom = moment(current);
                const produced = dateUtils.readPartByPresent(condition[0], mom);
                const result = dateUtils.execSubEquality(condition[1], produced);
                if (!result.success) {
                    return ctx.failed({
                        current: current.toISOString(),
                        produced,
                        equality: result.equality,
                        comparison: result.comparison.join(','),
                        reason: result.reason,
                    });
                }
                return true;
            }
        });
    }
}

const deco = decorator.addIdentifier(InRange, ['field', 'parameter']);
deco.addKeyword('validator', 'ph:field', 'ph:deco', 'ph:current', 'ph:equality', 'ph:comparison', 'ph:reason', 'ph:produced');
