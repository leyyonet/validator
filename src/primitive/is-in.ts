import {decorator} from "@leyyo/core";
import {ClassLike, Dict, is, leyyo, Wrap} from "@leyyo/common";
import {arrayUtils, ScalarHashLambda, SD} from "@leyyo/scalar";
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
 * Data must be in given seeds
 *
 * Conditions
 * - not-empty
 *
 * Relations
 * - {@link NotIn} - inverse
 */
export function IsIn(seeds?: SD.Value<any>): PropertyDecorator;
export function IsIn(seeds?: SD.Value<any>): ParameterDecorator;
export function IsIn(opt?: O): ParameterDecorator;
export function IsIn(opt?: O): ParameterDecorator;
export function IsIn(v1?: SD.Value<any> | O): PropertyDecorator | ParameterDecorator {
    return (clazz: object, property?: PropertyKey, index?: number) => {
        const ins = deco.fork(clazz, property, index);
        const {opt, constraint} = validatorHub.pool.options<C>(ins, v1, 'seeds', 'array');
        constraint.compareFn = arrayUtils.getHashLambda(constraint.compareFn, ins.assigned.type);

        validatorHub.pool.add<C, P>({
            ins, opt, constraint,
            error: '{{field}} must be in {{seeds}}',
            is: (current) => is.empty(current),
            validates: (current, ctx) => {

                const {seeds, compareFn} = ctx.constraint;
                if (!Array.isArray(seeds) || seeds.length < 1) {
                    return true;
                }
                if (!arrayUtils.includes(seeds, [current], compareFn)) {
                    return ctx.failed({
                        seeds: !compareFn ? seeds.join(', ') : leyyo.secureJson(seeds),
                    });
                }
                return true;
            }
        });
    }
}


const deco = decorator.addIdentifier(IsIn, ['field', 'parameter']);
deco.addKeyword('validator', 'ph:field', 'ph:deco', 'ph:current', 'ph:seeds');