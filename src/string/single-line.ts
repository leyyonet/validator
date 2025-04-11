import {decorator} from "@leyyo/core";
import {Dict} from "@leyyo/common";
import {stringUtils} from "@leyyo/scalar";
import {validatorHub, VD} from "../base";


type P = VD.Placeholder;
type C = Dict;
type O = VD.Opt & C;

/**
 * Data must be single line
 *
 * Conditions
 * - string
 *
 * Relations
 * - {@link MinItems} - inverse
 */
export function SingleLine(opt?: O): ParameterDecorator;
export function SingleLine(opt?: O): ParameterDecorator;
export function SingleLine(v1?: O): PropertyDecorator | ParameterDecorator {
    return (clazz: object, property?: PropertyKey, index?: number) => {
        const ins = deco.fork(clazz, property, index);
        const {opt, constraint} = validatorHub.pool.options<C>(ins, v1);

        validatorHub.pool.add<C, P, string>({
            ins, opt, constraint,
            error: '{{field}} must be single line',
            is: (current) => typeof current === 'string',
            validates: (current, ctx) => {

                if (stringUtils.hasLine(current)) {
                    return ctx.failed({});
                }

                return true;
            }
        });
    }
}

const deco = decorator.addIdentifier(SingleLine, ['field', 'parameter']);
deco.addKeyword('validator', 'ph:field', 'ph:deco', 'ph:current');