import {decorator} from "@leyyo/core";
import {Dict} from "@leyyo/common";
import {stringUtils} from "@leyyo/scalar";
import {validatorHub, VD} from "../base";


type P = VD.Placeholder;
type C = Dict;
type O = VD.Opt & C;

/**
 * Data must not contain tab
 *
 * Conditions
 * - string
 *
 * Relations
 * - {@link MinItems} - inverse
 */
export function NoTabs(opt?: O): ParameterDecorator;
export function NoTabs(opt?: O): ParameterDecorator;
export function NoTabs(v1?: O): PropertyDecorator | ParameterDecorator {
    return (clazz: object, property?: PropertyKey, index?: number) => {
        const ins = deco.fork(clazz, property, index);
        const {opt, constraint} = validatorHub.pool.options<C>(ins, v1);

        validatorHub.pool.add<C, P, string>({
            ins, opt, constraint,
            error: '{{field}} must not contain tab',
            is: (current) => typeof current === 'string',
            validates: (current, ctx) => {

                if (stringUtils.hasTab(current)) {
                    return ctx.failed({});
                }

                return true;
            }
        });
    }
}

const deco = decorator.addIdentifier(NoTabs, ['field', 'parameter']);
deco.addKeyword('validator', 'ph:field', 'ph:deco', 'ph:current');