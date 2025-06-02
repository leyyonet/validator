import {decoratorPool} from "@leyyo/core";
import {$assert, $dev, Dict, Func} from "@leyyo/common";
import {FQN} from "../internal";
import {validatorIgnore} from "./validator.ignore";
import {IgnoreValidatorsOpt} from "./index.types";


interface P {
    allOrDecorators: true | Array<Func | string>;
}

export function IgnoreValidators(decorators?: Array<Func | string>): ClassDecorator;
export function IgnoreValidators(decorators?: Array<Func | string>): MethodDecorator;
export function IgnoreValidators(all?: true): ClassDecorator;
export function IgnoreValidators(all?: true): MethodDecorator;
export function IgnoreValidators(allOrDecorators: true | Array<Func | string> = true): ClassDecorator | MethodDecorator {
    return (clazz: object, property?: PropertyKey, descriptor?: TypedPropertyDescriptor<any>) =>
        deco.process(deco.fork(clazz, property, descriptor), {allOrDecorators});
}

const deco = decoratorPool.newId<IgnoreValidatorsOpt, Dict, P>(IgnoreValidators)
    .fqn(FQN)
    .targets('class', 'method')
    .keywords('manageable')
    .processor((ins, p) => {
        const opt = {functions: [], names: []} as IgnoreValidatorsOpt;
        opt.ins = ins;
        if (p.allOrDecorators === true) {
            opt.all = true;
        } else {
            $assert.array(p.allOrDecorators, () => $dev.desc(ins, {field: 'decorators'}));
            if (p.allOrDecorators.length < 1) {
                throw $dev.invalidError({issue: 'empty.array', desc: ins.description, field: 'decorators'});
            }
            opt.functions = p.allOrDecorators.filter(item => typeof item === 'function');
            opt.names = p.allOrDecorators.filter(item => typeof item === 'string');
        }
        ins.set(opt);

        if (ins.isClass) {
            validatorIgnore.addClass(ins.asClass, opt);
        } else if (ins.isMethod) {
            validatorIgnore.addMethod(ins.asMethod, opt);
        }
    });
