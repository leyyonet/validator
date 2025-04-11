import {decorator, fqn} from "@leyyo/core";
import {Func} from "@leyyo/common";
import {FQN_PCK} from "../internal";
import {validatorHub} from "../base";

export function IgnoreValidators(decorators?: Array<Func | string>): ClassDecorator;
export function IgnoreValidators(decorators?: Array<Func | string>): MethodDecorator;
export function IgnoreValidators(all?: true): ClassDecorator;
export function IgnoreValidators(all?: true): MethodDecorator;
export function IgnoreValidators(v1: true | Array<Func | string> = true): ClassDecorator | MethodDecorator {
    return (clazz: object, property?: PropertyKey, descriptor?: TypedPropertyDescriptor<any>) => {
        const ins = deco.fork(clazz, property, descriptor);
        if (ins.isOfClass()) {
            validatorHub.ignore.addClass(ins.asClass(), v1);
        } else if (ins.isOfMethod()) {
            validatorHub.ignore.addMethod(ins.asMethod(), v1);
        }
        if (v1 === true) {
            ins.set({all: true});
        } else {
            ins.set({decorators: v1});
        }
    }
}

fqn.decorator(IgnoreValidators, FQN_PCK);
const deco = decorator.addIdentifier(IgnoreValidators, ['class', 'method']);
deco.addKeyword('manageable');