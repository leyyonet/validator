import {decorator, fqn} from "@leyyo/core";
import {ClassLike, DeveloperException, Dict, Func, OneOrMore, Wrap} from "@leyyo/common";
import {validatorHub, VD} from "../base";
import {scalar, SD} from "@leyyo/scalar";

interface P extends VD.Placeholder {
    className: string;
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
export function NotInstanceOf(clazz: OneOrMore<Wrap<ClassLike | Func> | ClassLike | Func | string>): PropertyDecorator;
export function NotInstanceOf(clazz: OneOrMore<Wrap<ClassLike | Func> | ClassLike | Func | string>): ParameterDecorator;
export function NotInstanceOf(opt?: O): PropertyDecorator;
export function NotInstanceOf(opt?: O): ParameterDecorator;
export function NotInstanceOf(v1: OneOrMore<Wrap<ClassLike | Func> | ClassLike | Func | string> | O): PropertyDecorator | ParameterDecorator {
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
                error: '{{field}} must not be instance of {{className}} with {{currentName}}',
                is: (current) => current && typeof current === 'object',
                validates: (current, ctx) => {

                    const {functions, names} = ctx.constraint;
                    const currentName = current.constructor?.name;
                    const fqnName = fqn.exists(current) ? fqn.get(current) : current.constructor?.name

                    if (functions.some(clazz => current instanceof clazz)) {
                        return ctx.failed({
                            className: fqn.exists(clazz) ? fqn.get(ctx) : (clazz as Func).name,
                            currentName: fqnName
                        });
                    }
                    if (currentName && names.length > 0) {
                        if (names.some(name => [currentName, fqnName].includes(name))) {
                            return ctx.failed({
                                className: fqn.exists(clazz) ? fqn.get(ctx) : (clazz as Func).name,
                                currentName: fqnName
                            });
                        }
                    }
                    return true;
                }
            }
        );
    }
}


const deco = decorator.addIdentifier(NotInstanceOf, ['field', 'parameter']);
deco.addKeyword('validator', 'ph:field', 'ph:deco', 'ph:current', 'ph-className', 'ph-currentName');