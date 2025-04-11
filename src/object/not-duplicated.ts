import {decorator} from "@leyyo/core";
import {Arr, ClassLike, Dict, Wrap} from "@leyyo/common";
import {validatorHub, VD} from "../base";
import {arrayUtils, scalar, ScalarHashLambda, SD} from "@leyyo/scalar";

interface P extends VD.Placeholder {
    duplicated: number;
}

interface CGiven extends Dict {
    predicate?: Wrap<ClassLike | ScalarHashLambda>;
}

type O = VD.Opt & CGiven;
type C = CGiven & SD.FetchLambdaShared;

/**
 * Checks if array contains all values from the given array of values.
 * If null or undefined is given then this function returns false.
 */
export function NotDuplicated(predicate: ClassLike | ScalarHashLambda): PropertyDecorator;
export function NotDuplicated(predicate: ClassLike | ScalarHashLambda): ParameterDecorator;
export function NotDuplicated(opt?: O): PropertyDecorator;
export function NotDuplicated(opt?: O): ParameterDecorator;
export function NotDuplicated(v1: ClassLike | ScalarHashLambda | O): PropertyDecorator | ParameterDecorator {
    return (clazz: object, property: PropertyKey, index?: number) => {
        const ins = deco.fork(clazz, property, index);
        const result = scalar.fetchLambdaOne<C, VD.OptPro>(ins, v1, {
            primaryKey: 'predicate',
            options: true
        }, (ins, value) => validatorHub.pool.options(ins, value));
        const {opt, constraint} = result;
        if (!result.clazz) {
            constraint.predicate = arrayUtils.getHashLambda(undefined, ins.assigned.type);
        }

        validatorHub.pool.add<C, P, Arr>(
            {
                ins, opt, constraint,
                error: '{{field}} must not contain be duplicated, but there are {{duplicated}} duplicated elements',
                is: (current) => Array.isArray(current) || (current instanceof Set),
                validates: (current, ctx) => {

                    const size = scalar.size(current);
                    if (size > 0) {
                        const {predicate} = ctx.constraint;
                        if (current instanceof Set) {
                            current = Array.from(current.values());
                        }
                        if (arrayUtils.isDuplicated(current, predicate)) {
                            const unique = arrayUtils.unique(current, predicate);
                            return ctx.failed({
                                duplicated: size - unique.length
                            });
                        }
                    }
                    return true;
                }
            }
        );
    }
}

const deco = decorator.addIdentifier(NotDuplicated, ['field', 'parameter']);
deco.addKeyword('validator', 'ph:field', 'ph:deco', 'ph:current', 'ph:duplicated');