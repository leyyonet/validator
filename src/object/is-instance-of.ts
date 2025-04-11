import {decorator} from "@leyyo/core";
import {ClassLike, DeveloperException, Dict, Func, OneOrMore, Wrap} from "@leyyo/common";
import {validatorHub, VD} from "../base";
import {scalar, SD} from "@leyyo/scalar";

interface P extends VD.Placeholder {
    possibleNames: string;
    currentName: string;
}

interface CGiven extends Dict {
    clazz?: OneOrMore<Wrap<ClassLike | Func> | string>;
}

type O = VD.Opt & CGiven;
type C = CGiven & SD.FetchLambdaShared;

/**
 * Checks if array contains all values from the given array of values.
 * If null or undefined is given then this function returns false.
 */
export function IsInstanceOf(clazz: OneOrMore<Wrap<ClassLike | Func> | ClassLike | Func | string>): PropertyDecorator;
export function IsInstanceOf(clazz: OneOrMore<Wrap<ClassLike | Func> | ClassLike | Func | string>): ParameterDecorator;
export function IsInstanceOf(opt?: O): PropertyDecorator;
export function IsInstanceOf(opt?: O): ParameterDecorator;
export function IsInstanceOf(v1: OneOrMore<Wrap<ClassLike | Func> | ClassLike | Func | string> | O): PropertyDecorator | ParameterDecorator {
    return (clazz: object, property: PropertyKey, index?: number) => {
        const ins = deco.fork(clazz, property, index);
        const result = scalar.fetchLambdaMultiple<C, VD.OptPro>(ins, v1, {
            primaryKey: 'clazz',
            named: true,
            array: true,
            options: true
        }, (ins, value) => validatorHub.pool.options(ins, value));
        if (result.classes.length < 1) {
            throw new DeveloperException('empty.classes', {deco: ins.description});
        }
        const {opt, constraint} = result;

        validatorHub.pool.add<C, P, Dict>(
            {
                ins, opt, constraint,
                error: '{{field}} must be instance of {{possibleNames}}',
                is: (current) => current && typeof current === 'object',
                validates: (current, ctx) => {

                    const {functions, names, possibleNames} = ctx.constraint;
                    if (functions.some(clazz => current instanceof clazz)) {
                        return true;
                    }
                    const currentName = current.constructor?.name;
                    if (currentName && names.length > 0) {
                        if (names.some(name => name === currentName)) {
                            return true;
                        }
                    }
                    return ctx.failed({possibleNames, currentName});
                }
            }
        );
    }
}

const deco = decorator.addIdentifier(IsInstanceOf, ['field', 'parameter']);
deco.addKeyword('validator', 'ph:field', 'ph:deco', 'ph:current', 'ph-possibleNames');