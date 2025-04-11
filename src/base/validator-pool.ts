import {ClassReflectionLike, DecoInstanceLike, footprint, Fqn, PropertyReflectionLike} from "@leyyo/core";
import {BasicType, DeveloperException, Dict, ExceptionClass, is, OneOrMore, storage} from "@leyyo/common";
import {scalar, SD} from "@leyyo/scalar";
import {ValidatorHubLike, ValidatorPoolLike,} from "./index-types";
import {VD} from "./index-shared";
import {FQN_PCK} from "../internal";

@Fqn(FQN_PCK)
export class ValidatorPool implements ValidatorPoolLike {
    private readonly hub: ValidatorHubLike;

    private readonly classItems: Map<ClassReflectionLike, Map<string, VD.PropertyItem>>;
    private readonly classSelfItems: Map<ClassReflectionLike, Array<VD.Item>>;
    private readonly methodItems: Map<PropertyReflectionLike, Map<number, VD.ParameterItem>>;

    constructor(hub: ValidatorHubLike) {
        this.hub = hub;
        this.classItems = storage.newMap('ValidatorPool.classItems');
        this.classSelfItems = storage.newMap('ValidatorPool.classSelfItems');
        this.methodItems = storage.newMap('ValidatorPool.methodItems');
    }

    hasClass(clazz: ClassReflectionLike): boolean {
        return this.classItems.has(clazz);
    }

    getClassProps(clazz: ClassReflectionLike): Map<string, VD.PropertyItem> {
        return this.classItems.get(clazz);
    }

    hasMethod(method: PropertyReflectionLike): boolean {
        return this.methodItems.has(method);
    }

    getMethodParams(method: PropertyReflectionLike): Map<number, VD.ParameterItem> {
        return this.methodItems.get(method);
    }

    hasSelf(clazz: ClassReflectionLike): boolean {
        return this.classSelfItems.has(clazz);
    }

    getSelfItems(clazz: ClassReflectionLike): Array<VD.Item> {
        return this.classSelfItems.get(clazz);
    }

    options<C extends Dict = Dict>(ins: DecoInstanceLike, given: any, primaryKey?: keyof C, primaryTypes?: OneOrMore<BasicType | 'array' | string>): SD.OptProExtracted<C, VD.OptPro> {
        const all = scalar.options<C, VD.Opt>(ins, given, ['scope', 'when', 'error'], {
            primaryKey,
            primaryTypes
        }) as SD.OptProExtracted<C, VD.OptPro>;
        const error = all.opt.error as unknown as VD.ErrorAny;
        if (error) {
            if (typeof error === 'string') {
                all.opt.error = {
                    type: 'message',
                    message: error,
                }
            } else if (typeof error === 'function') {
                if (footprint.isClass(error, true)) {
                    all.opt.error = {
                        type: 'class',
                        clazz: error as ExceptionClass,
                    }
                } else {
                    all.opt.error = {
                        type: 'function',
                        fn: error as VD.ErrorLambda,
                    }
                }
            } else if (is.object(error)) {
                if (typeof error.message === 'string' && footprint.isClass(error.clazz, true)) {
                    all.opt.error = {
                        type: 'both',
                        message: error.message,
                        clazz: error.clazz,
                    };
                } else {
                    throw new DeveloperException('invalid.error.object', {
                        deco: ins.description,
                        place: 'option',
                        error
                    });
                }
            } else {
                throw new DeveloperException('invalid.error.type', {
                    deco: ins.description,
                    place: 'option',
                    type: typeof error
                });
            }
        }
        return all;
    }


    private _setItemError<C extends Dict = Dict>(ins: DecoInstanceLike, error: string | ExceptionClass | VD.GivenError, item: VD.Item<C>): void {
        if (error) {
            if (typeof error === 'string') {
                item.error = {
                    type: 'message',
                    message: error,
                };
            } else if (typeof error === 'function') {
                if (footprint.isClass(error, true)) {
                    item.error = {
                        type: 'class',
                        clazz: error as ExceptionClass,
                    };
                } else {
                    throw new DeveloperException('invalid.error.class', {
                        deco: ins.description,
                        place: 'item',
                        name: error.name
                    });
                }
            } else if (is.object(error)) {
                if (typeof error.message === 'string' && footprint.isClass(error.clazz, true)) {
                    item.error = {
                        type: 'both',
                        message: error.message,
                        clazz: error.clazz,
                    };
                } else {
                    throw new DeveloperException('invalid.error.object', {deco: ins.description, place: 'item', error});
                }
            } else {
                throw new DeveloperException('invalid.error.type', {
                    deco: ins.description,
                    place: 'item',
                    type: typeof error
                });
            }
        }
    }

    private _setItemIs<C extends Dict = Dict>(ins: DecoInstanceLike, lambda: VD.PassLambda, item: VD.Item<C>): void {
        if (is.empty(lambda)) {
            item.is = () => true;
            return;
        }
        if (typeof lambda === 'function') {
            item.is = lambda;
            return;
        }
        throw new DeveloperException('invalid.is', {deco: ins.description});
    }

    private _setItemValidates<C extends Dict = Dict, P extends VD.Placeholder = VD.Placeholder>(ins: DecoInstanceLike, validates: VD.Lambda<C, P>, item: VD.Item<C>): void {
        if (typeof validates !== 'function') {
            throw new DeveloperException('invalid.validates', {deco: ins.description});
        }
        if (footprint.isAsync(validates)) {
            item.validates = {isAsync: true, fn: validates};
        } else {
            item.validates = {fn: validates};
        }
    }

    add<C extends Dict = Dict, P extends VD.Placeholder = VD.Placeholder, E = any>(given: VD.AddGiven<C, P>): void {
        if (!is.object(given)) {
            throw new DeveloperException('invalid.given');
        }
        const item = scalar.buildItem(given.ins, given.opt, given.constraint) as VD.Item<C>;

        this._setItemError(given.ins, given.error, item);
        this._setItemIs(given.ins, given.is, item);
        this._setItemValidates(given.ins, given.validates, item);

        if (item.ins.isOfField()) {
            const property = item.ins.asField();
            const clazz = property.clazz;
            if (!this.classItems.has(clazz)) {
                this.classItems.set(clazz, new Map<string, VD.PropertyItem>());
            }
            const classProps = this.classItems.get(clazz);
            const name = property.name as string;
            if (!classProps.has(name)) {
                classProps.set(name, {property, items: []});
            }
            classProps.get(name).items.push(item);
        } else if (item.ins.isOfParameter()) {
            const parameter = item.ins.asParameter();
            const method = parameter.property;
            if (!this.methodItems.has(method)) {
                this.methodItems.set(method, new Map<number, VD.ParameterItem>());
            }
            const methodParams = this.methodItems.get(method);
            if (!methodParams.has(parameter.index)) {
                methodParams.set(parameter.index, {parameter, items: []});
            }
            methodParams.get(parameter.index).items.push(item);
        } else if (item.ins.isOfClass()) {
            const clazz = item.ins.asClass();
            if (!this.classSelfItems.has(clazz)) {
                this.classSelfItems.set(clazz, []);
            }
            this.classSelfItems.get(clazz).push(item);
        } else {
            throw new DeveloperException('invalid.target', {deco: item.ins.description});
        }
    }
}