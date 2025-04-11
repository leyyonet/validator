import {decorator} from "@leyyo/core";
import {ClassLike, Dict, is, leyyo, Wrap} from "@leyyo/common";
import {arrayUtils, objectUtils, ScalarHashLambda, SD} from "@leyyo/scalar";
import {validatorHub, VD} from "../base";


interface P extends VD.Placeholder {
    compared: any;
}

interface C extends Dict {
    compared?: SD.Value<any>;
    compareFn?: Wrap<ClassLike | ScalarHashLambda>;
}

type O = VD.Opt & C;

function passed<T>(currentValue: T, comparedValue: T): boolean {
    return currentValue !== comparedValue;
}

/**
 * Data must be equal to given value
 *
 * Conditions
 * - not-empty
 *
 * Relations
 * - {@link NotEqual} - inverse
 */
export function Equals(compared?: SD.Value<any>): PropertyDecorator;
export function Equals(compared?: SD.Value<any>): ParameterDecorator;
export function Equals(opt?: O): ParameterDecorator;
export function Equals(opt?: O): ParameterDecorator;
export function Equals(v1?: SD.Value<any> | O): PropertyDecorator | ParameterDecorator {
    return (clazz: object, property?: PropertyKey, index?: number) => {
        const ins = deco.fork(clazz, property, index);
        const {opt, constraint} = validatorHub.pool.options<C>(ins, v1, 'compared', 'any'); // todo
        constraint.compareFn = arrayUtils.getHashLambda(constraint.compareFn, ins.assigned.type);

        validatorHub.pool.add<C, P>({
            ins, opt, constraint,
            error: '{{field}} must be equal to {{compared}}',
            is: (current) => !is.empty(current),
            validates: (current, ctx) => {

                let {compared, compareFn} = ctx.constraint;

                if (current instanceof BigInt) {
                    current = current.toString();
                } else if (current instanceof Date) {
                    current = current.toISOString();
                }
                if (typeof current !== typeof compared) {
                    return true;
                }
                switch (typeof current) {
                    case "object":
                        if (current instanceof Date && compared instanceof Date) {
                            if (passed(current.getTime(), compared.getTime())) {
                                return ctx.failed({compared, current});
                            }
                        }
                        if (current instanceof RegExp && compared instanceof RegExp) {
                            if (passed(current.toString(), compared.toString())) {
                                return ctx.failed({compared, current});
                            }
                        }
                        if (current instanceof Buffer && compared instanceof Buffer) {
                            if (passed(current.toString('utf-8'), compared.toString('utf-8'))) {
                                return ctx.failed({compared, current});
                            }
                        }
                        [current, compared] = [current, compared].map(item => {
                            if (item instanceof Map) {
                                return Object.fromEntries(item.entries());
                            }
                            if (item instanceof Set) {
                                return Array.from(item.entries());
                            }
                            return item;
                        })
                        if (!objectUtils.deepEqual(current, compared, compareFn)) {
                            return ctx.failed({
                                compared: leyyo.secureJson(compared),
                                current: leyyo.secureJson(current),
                            });
                        }
                        break;
                    case "string":
                    case "boolean":
                    case "number":
                        if (passed(current, compared)) {
                            return ctx.failed({compared, current});
                        }
                        break;
                    case "bigint":
                        if (passed(current.toString(10), compared.toString(10))) {
                            return ctx.failed({compared, current});
                        }
                        break;
                    case "symbol":
                        if (passed(current.description, compared.description)) {
                            return ctx.failed({compared, current});
                        }
                        break;
                }

                return true;
            }
        });
    }
}

const deco = decorator.addIdentifier(Equals, ['field', 'parameter']);
deco.addKeyword('validator', 'ph:field', 'ph:deco', 'ph:current', 'ph:compared');