import {decorator} from "@leyyo/core";
import {Dict} from "@leyyo/common";
import {regexpType, SD, stringUtils} from "@leyyo/scalar";
import {validatorHub, VD} from "../base";
import {StringPattern} from "./index-types";


interface P extends VD.Placeholder {
    pattern: any;
}

interface C extends Dict {
    pattern?: SD.Value<StringPattern>;
}

type O = VD.Opt & C;

/**
 * Data must be matched by given pattern
 *
 * Conditions
 * - string
 *
 * Relations
 * - {@link MinItems} - inverse
 */
export function Matches(pattern?: SD.Value<StringPattern>): PropertyDecorator;
export function Matches(pattern?: SD.Value<StringPattern>): ParameterDecorator;
export function Matches(opt?: O): ParameterDecorator;
export function Matches(opt?: O): ParameterDecorator;
export function Matches(v1?: SD.Value<StringPattern> | O): PropertyDecorator | ParameterDecorator {
    return (clazz: object, property?: PropertyKey, index?: number) => {
        const ins = deco.fork(clazz, property, index);
        const {opt, constraint} = validatorHub.pool.options<C>(ins, v1, 'pattern', ['string', 'array', 'RegExp']);

        validatorHub.pool.add<C, P, string>({
            ins, opt, constraint,
            error: '{{field}} must be matched by {{pattern}}',
            is: (current) => typeof current === 'string',
            validates: (current, ctx) => {

                const {pattern} = ctx.constraint;
                if (typeof pattern !== 'string' && !Array.isArray(pattern) && !(pattern instanceof RegExp)) {
                    return true;
                }

                let regExp: RegExp;
                if (pattern instanceof RegExp) {
                    regExp = pattern;
                } else {
                    try {
                        regExp = regexpType.cast(pattern);
                    } catch (e) {
                        console.log('invalid.regexp', {deco: ctx.ins.description, pattern, error: e.message});
                        return true;
                    }
                }
                if (!regExp.test(current)) {
                    return ctx.failed({pattern: stringUtils.regexpToString(pattern)});
                }

                return true;
            }
        });
    }
}

const deco = decorator.addIdentifier(Matches, ['field', 'parameter']);
deco.addKeyword('validator', 'ph:field', 'ph:deco', 'ph:current', 'ph:pattern');