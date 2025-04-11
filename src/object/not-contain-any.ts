import {decorator} from "@leyyo/core";
import {arrayUtils, ScalarHashLambda, SD} from "@leyyo/scalar";
import {Arr, ClassLike, Dict, Wrap} from "@leyyo/common";
import {validatorHub, VD} from "../base";

interface P extends VD.Placeholder {
    seeds: any;
}

interface C extends Dict {
    seeds?: SD.Value<Array<any>>;
    compareFn?: Wrap<ClassLike | ScalarHashLambda>;
}

type O = VD.Opt & C;

/**
 * Checks if array does not contain any value from the given seeds.
 *
 * Conditions
 * - array
 *
 * Relations
 * - {@link ContainsAny} - inverse
 * - {@link NotContainEvery} - every
 */
export function NotContainAny(seeds: SD.Value<Array<any>>): PropertyDecorator;
export function NotContainAny(seeds: SD.Value<Array<any>>): ParameterDecorator;
export function NotContainAny(opt?: O): PropertyDecorator;
export function NotContainAny(opt?: O): ParameterDecorator;
export function NotContainAny(v1: SD.Value<Array<any>> | O): PropertyDecorator | ParameterDecorator {
    return (clazz: object, property: PropertyKey, index?: number) => {
        const ins = deco.fork(clazz, property, index);
        const {opt, constraint} = validatorHub.pool.options<C>(ins, v1, 'seeds', 'array');
        constraint.compareFn = arrayUtils.getHashLambda(constraint.compareFn, ins.assigned.type);

        validatorHub.pool.add<C, P, Arr>(
            {
                ins, opt, constraint,
                error: '{{field}} must not contain any of {{seeds}} values',
                is: (current) => Array.isArray(current) || (current instanceof Set),
                validates: (current, ctx) => {

                    const {seeds, compareFn} = ctx.constraint;
                    if (Array.isArray(seeds) && seeds.length > 0) {
                        if (current instanceof Set) {
                            current = Array.from(current.values());
                        }
                        if (arrayUtils.includes(current, seeds, compareFn)) {
                            return ctx.failed({seeds});
                        }
                    }

                    return true;
                }
            }
        );
    }
}

const deco = decorator.addIdentifier(NotContainAny, ['field', 'parameter']);
deco.addKeyword('validator', 'ph:field', 'ph:deco', 'ph:current', 'ph:seeds');