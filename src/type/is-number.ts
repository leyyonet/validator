import {decorator} from "@leyyo/core";
import {Dict, is} from "@leyyo/common";
import {floatType, SD} from "@leyyo/scalar";
import {validatorHub, VD} from "../base";
import {typeHelper} from "./type-helper";


interface P extends VD.Placeholder {
    type: any;
}

interface C extends Dict {
    weak?: SD.Value<boolean>;
}

type O = VD.Opt & C;

/**
 * Data must be a number
 *
 * Conditions
 * - not-empty
 *
 */
export function IsNumber(weak?: SD.Value<boolean>): PropertyDecorator;
export function IsNumber(weak?: SD.Value<boolean>): ParameterDecorator;
export function IsNumber(opt?: O): ParameterDecorator;
export function IsNumber(opt?: O): ParameterDecorator;
export function IsNumber(v1?: SD.Value<boolean> | O): PropertyDecorator | ParameterDecorator {
    return (clazz: object, property?: PropertyKey, index?: number) => {
        const ins = deco.fork(clazz, property, index);
        const {opt, constraint} = validatorHub.pool.options<C>(ins, v1, 'weak', 'boolean');

        validatorHub.pool.add<C, P>({
            ins, opt, constraint,
            error: '{{field}} must be a number, but it is {{type}}',
            is: (current) => !is.empty(current),
            validates: (current, ctx) => {

                const {weak} = ctx.constraint;
                if (!typeHelper.isValid(weak,
                    () => floatType.cast(current),
                    () => typeof current === 'number')) {
                    return ctx.failed({type: typeHelper.getType(current)});
                }
                return true;
            }
        });
    }
}

const deco = decorator.addIdentifier(IsNumber, ['field', 'parameter']);
deco.addKeyword('validator', 'ph:field', 'ph:deco', 'ph:current', 'ph-type');