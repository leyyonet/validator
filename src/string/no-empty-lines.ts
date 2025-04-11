import {decorator} from "@leyyo/core";
import {Dict} from "@leyyo/common";
import {stringUtils} from "@leyyo/scalar";
import {validatorHub, VD} from "../base";


type P = VD.Placeholder;
type C = Dict;
type O = VD.Opt & C;

/**
 * Data must not contain empty lines
 *
 * Conditions
 * - string
 *
 * Relations
 * - {@link MinItems} - inverse
 */
export function NoEmptyLines(opt?: O): ParameterDecorator;
export function NoEmptyLines(opt?: O): ParameterDecorator;
export function NoEmptyLines(v1?: O): PropertyDecorator | ParameterDecorator {
    return (clazz: object, property?: PropertyKey, index?: number) => {
        const ins = deco.fork(clazz, property, index);
        const {opt, constraint} = validatorHub.pool.options<C>(ins, v1);

        validatorHub.pool.add<C, P, string>({
            ins, opt, constraint,
            error: '{{field}} must not contain empty lines',
            is: (current) => typeof current === 'string',
            validates: (current, ctx) => {

                if (stringUtils.hasEmptyLine(current)) {
                    return ctx.failed({});
                }

                return true;
            }
        });
    }
}

const deco = decorator.addIdentifier(NoEmptyLines, ['field', 'parameter']);
deco.addKeyword('validator', 'ph:field', 'ph:deco', 'ph:current');