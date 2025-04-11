import {decorator} from "@leyyo/core";
import {Dict} from "@leyyo/common";
import {SD} from "@leyyo/scalar";
import {validatorHub, VD} from "../base";
import {StringTrimType} from "./index-types";


interface P extends VD.Placeholder {
    type: any;
}

interface C extends Dict {
    type?: SD.Value<StringTrimType>;
}

type O = VD.Opt & C;

/**
 * Data must be trimmed
 *
 * Conditions
 * - string
 */
export function IsTrimmed(type?: SD.Value<StringTrimType>): PropertyDecorator;
export function IsTrimmed(type?: SD.Value<StringTrimType>): ParameterDecorator;
export function IsTrimmed(opt?: O): ParameterDecorator;
export function IsTrimmed(opt?: O): ParameterDecorator;
export function IsTrimmed(v1?: SD.Value<StringTrimType> | O): PropertyDecorator | ParameterDecorator {
    return (clazz: object, property?: PropertyKey, index?: number) => {
        const ins = deco.fork(clazz, property, index);
        const {opt, constraint} = validatorHub.pool.options<C>(ins, v1, 'type', 'string');

        validatorHub.pool.add<C, P, string>({
            ins, opt, constraint,
            error: '{{field}} must be trimmed',
            is: (current) => typeof current === 'string',
            validates: (current, ctx) => {

                const {type} = ctx.constraint;
                switch (type) {
                    case "start":
                        if (current.trimStart() !== current) {
                            return ctx.failed({type: 'start'});
                        }
                        break;
                    case "end":
                        if (current.trimEnd() !== current) {
                            return ctx.failed({type: 'end'});
                        }
                        break;
                    default:
                        if (current.trim() !== current) {
                            return ctx.failed({type: 'both'});
                        }
                        break;
                }
                return true;
            }
        });
    }
}

const deco = decorator.addIdentifier(IsTrimmed, ['field', 'parameter']);
deco.addKeyword('validator', 'ph:field', 'ph:deco', 'ph:current', 'ph:type');