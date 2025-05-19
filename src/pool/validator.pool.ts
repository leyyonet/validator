import {
    ClassReflectionLike,
    CoreReflectionLike,
    DecoInstanceLike,
    decoratorPool,
    footprint,
    Fqn,
    lifecycle,
    ParameterReflectionLike,
    PropertyReflectionLike,
    reflectionPool
} from "@leyyo/core";
import {$assert, $descriptor, $dev, $is, $repo, ExceptionClass, List} from "@leyyo/common";
import {FQN_PCK} from "../internal";
import {callItem, callOption, CallParams, OptKeyCondition} from "@leyyo/call";
import {
    GivenError,
    ValErrorAny,
    ValErrorLambda,
    ValErrorPro,
    ValidatorAddGiven,
    ValidatorEndpointInfo,
    ValidatorItem,
    ValidatorItemCollection,
    ValidatorLambdaAny,
    ValidatorMetadata,
    ValidatorOpt,
    ValidatorOptPro,
    ValidatorPassLambda,
    ValidatorPoolLike,
    ValidatorStored
} from "./index.types";
import {httpSigner} from "@leyyo/http";
import {IdValidator} from "../index.symbols";

@Fqn(FQN_PCK)
class ValidatorPool implements ValidatorPoolLike {
    private readonly KEYS = ['scope', 'when'] as Array<keyof ValidatorOpt>;
    private readonly CONDITION = {
        string: ['scope'],
        array: ['scope'],
        function: ['when'],
    } as OptKeyCondition<ValidatorOpt>;

    private readonly _usedDecoratorInstances: List<DecoInstanceLike>;

    private readonly _endpointInfo: Map<PropertyReflectionLike, ValidatorEndpointInfo>;
    private readonly _applicationItems: ValidatorItemCollection;

    private readonly _controllerItems: Map<ClassReflectionLike, ValidatorItemCollection>;
    private readonly _endpointItems: Map<PropertyReflectionLike, ValidatorItemCollection>;

    private readonly _parameterItems: Map<ParameterReflectionLike, Array<ValidatorItem>>;

    // @todo if is typeClass ise ignore selectedParameters
    private readonly _typeClassItems: Map<ClassReflectionLike, Array<ValidatorItem>>;
    private readonly _dtoPropertyItems: Map<PropertyReflectionLike, Array<ValidatorItem>>;

    constructor() {
        this._usedDecoratorInstances = $repo.newList(FQN_PCK, 'usedDecoratorInstances');
        this._endpointInfo = $repo.newMap(FQN_PCK, 'endpointInfo');

        this._applicationItems = this._newCollection2d();
        this._controllerItems = $repo.newMap(FQN_PCK, 'controllerItems');
        this._endpointItems = $repo.newMap(FQN_PCK, 'endpointItems');
        this._parameterItems = $repo.newMap(FQN_PCK, 'parameterItems');
        this._typeClassItems = $repo.newMap(FQN_PCK, 'typeClassItems');
        this._dtoPropertyItems = $repo.newMap(FQN_PCK, 'dtoPropertyItems');

        lifecycle.onClear(50, 'PipePool', () => {
            this._usedDecoratorInstances.clear();
        })
        lifecycle.onRedundant(50, 'PipePool', () => {
            this._findRedundant();
        })
    }

    private _newCollection2d(): ValidatorItemCollection {
        return {}
    }

    private _append2d(coll: ValidatorItemCollection, item: ValidatorItem): void {
        item.opt.selectedParameters.forEach(f => {
            if (coll[f] === undefined) {
                coll[f] = [];
            }
            coll[f].push(item as ValidatorItem)
        });
    }

    private _get2d(coll: ValidatorItemCollection, field: string): Array<ValidatorItem> {
        if (coll[field] === undefined) {
            return [];
        }
        return coll[field];
    }

    // region add

    private _setItemIs(ins: DecoInstanceLike, lambda: ValidatorPassLambda, item: ValidatorItem): void {
        if ($is.empty(lambda)) {
            item.is = () => true;
            return;
        }
        if (typeof lambda === 'function') {
            item.is = lambda;
            return;
        }
        throw $dev.invalidError({
            issue: 'invalid.is.lambda',
            field: 'item.error',
            type: typeof item.is,
            value: item.is,
            desc: ins.description,
            where: 'leyyo.pipe.ValidatorPool',
            method: '_setItemIs'
        });
    }

    private _setItemValidates(ins: DecoInstanceLike, validates: ValidatorLambdaAny, item: ValidatorItem): void {
        $assert.func(validates, () => $dev.desc(ins, {
            field: 'validates',
            where: 'leyyo.pipe.ValidatorPool',
            method: '_setItemValidates'
        }));
        if (footprint.isAsync(validates)) {
            item.validates = {isAsync: true, fn: validates};
        } else {
            item.validates = {fn: validates};
        }
    }

    private _setItemError<P extends CallParams = CallParams>(ins: DecoInstanceLike, error: string | ExceptionClass | GivenError, item: ValidatorItem<P>): void {
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
                    throw $dev.invalidError({
                        issue: 'invalid.error.class',
                        field: 'items.error',
                        error,
                        desc: ins.description,
                        where: 'leyyo.validator.ValidatorPool',
                        method: '_setItemError'
                    });
                }
            } else if ($is.object(error)) {
                if (typeof error.message === 'string' && footprint.isClass(error.clazz, true)) {
                    item.error = {
                        type: 'both',
                        message: error.message,
                        clazz: error.clazz,
                    };
                } else {
                    throw $dev.invalidError({
                        issue: 'invalid.error.object',
                        field: 'item.error',
                        error,
                        desc: ins.description,
                        where: 'leyyo.validator.ValidatorPool',
                        method: '_setItemError'
                    });
                }
            } else {
                throw $dev.invalidError({
                    issue: 'invalid.error.type',
                    field: 'item.error',
                    type: typeof error,
                    error,
                    desc: ins.description,
                    where: 'leyyo.validator.ValidatorPool',
                    method: '_setItemError'
                });
            }
        }
    }

    protected _beforeAdd(given: ValidatorAddGiven): ValidatorItem {
        if (!$is.object(given)) {
            throw $dev.invalidError({
                issue: 'invalid.add.dto',
                field: 'given',
                type: typeof given,
                value: given,
                where: 'leyyo.pipe.ValidatorPool',
                method: 'add'
            });
        }
        const item = callItem.buildItem(given.ins, given.opt, given.params) as ValidatorItem;

        this._setItemError(given.ins, given.error, item);
        this._setItemIs(given.ins, given.is, item);
        this._setItemValidates(given.ins, given.validates, item);

        return item;
    }

    protected _add2d<R extends CoreReflectionLike>(ref: R, map: Map<R, ValidatorItemCollection>, item: ValidatorItem): void {
        this._usedDecoratorInstances.push(item.ins);
        if (!map.has(ref)) {
            map.set(ref, this._newCollection2d());
        }
        this._append2d(map.get(ref), item);
    }

    protected _addApplication(given: ValidatorAddGiven): void {
        const item = this._beforeAdd(given);
        this._usedDecoratorInstances.push(item.ins);
        this._append2d(this._applicationItems, item);
    }

    protected _addControllerClass(given: ValidatorAddGiven): void {
        const item = this._beforeAdd(given);
        this._add2d(item.ins.asClass, this._controllerItems, item);
    }

    protected _addEndpointMethod(given: ValidatorAddGiven): void {
        const item = this._beforeAdd(given);
        this._add2d(item.ins.asMethod, this._endpointItems, item);
    }

    protected _addEndpointParameter(given: ValidatorAddGiven): void {
        const item = this._beforeAdd(given);
        const paramRef = item.ins.asParameter;
        if (!this._parameterItems.has(paramRef)) {
            this._parameterItems.set(paramRef, []);
        }
        this._parameterItems.get(paramRef).push(item);
    }

    protected _addTypeClass(given: ValidatorAddGiven): void {
        const item = this._beforeAdd(given);
        const classRef = item.ins.asClass;
        if (!this._typeClassItems.has(classRef)) {
            this._typeClassItems.set(classRef, []);
        }
        this._typeClassItems.get(classRef).push(item);
    }

    protected _addDtoProperty(given: ValidatorAddGiven): void {
        const item = this._beforeAdd(given);
        const fieldRef = item.ins.asField;
        if (!this._dtoPropertyItems.has(fieldRef)) {
            this._dtoPropertyItems.set(fieldRef, []);
        }
        this._dtoPropertyItems.get(fieldRef).push(item);
    }

    // endregion add

    private _setOptError<P extends CallParams = CallParams>(ins: DecoInstanceLike, err: ValErrorAny<P>): ValErrorPro<P> {
        if (typeof err === 'string') {
            return {
                type: 'message',
                message: err,
            }
        }
        if (typeof err === 'function') {
            if (footprint.isClass(err, true)) {
                return {
                    type: 'class',
                    clazz: err as ExceptionClass,
                }
            }
            return {
                type: 'function',
                fn: err as ValErrorLambda<P>,
            }
        }
        if ($is.object(err)) {
            if (typeof err.message === 'string' && footprint.isClass(err.clazz, true)) {
                return {
                    type: 'both',
                    message: err.message,
                    clazz: err.clazz,
                };
            }
            throw $dev.invalidError({
                issue: 'invalid.error.object',
                field: 'options.error',
                error: err,
                desc: ins.description,
                where: 'leyyo.validator.ValidatorPool',
                method: '_setOptError'
            });
        } else {
            throw $dev.invalidError({
                issue: 'invalid.error.type',
                field: 'options.error',
                type: typeof err,
                error: err,
                desc: ins.description,
                where: 'leyyo.validator.ValidatorPool',
                method: '_setOptError'
            });
        }
    }

    options<P extends CallParams = CallParams>(ins: DecoInstanceLike, given: any): ValidatorOptPro<P> {
        const opt = callOption.read<ValidatorOpt<P>, ValidatorOptPro<P>>(ins, given, this.KEYS, this.CONDITION);
        if (opt.error !== undefined) {
            opt.error = this._setOptError(ins, opt.error as ValErrorAny);
        }
        if (ins.isClass || ins.isMethod) {
            $assert.textArray(opt.selectedParameters, () => $dev.desc(ins, {field: 'options.selectedParameters'}));
        } else if (!$is.empty(opt.selectedParameters)) {
            throw $dev.developerError({issue: 'parameters.can.be.used.in.class.or.parameter', desc: ins.description});
        }
        return opt;
    }

    protected _findRedundant(): void {
        decoratorPool.decorators()
            .filter(deco => deco.hasKeyword(IdValidator))
            .map(deco => deco.asIdentifier)
            .forEach(deco => {
                deco.instances.forEach(ins => {
                    if (!this._usedDecoratorInstances.includes(ins)) {
                        // todo
                        console.log(`unnecessary: ${ins.description}`);
                    }
                })
            })
    }

    protected _refreshEndpointInfo(methodRef: PropertyReflectionLike, field: keyof ValidatorEndpointInfo): void {
        if (!this._endpointInfo.has(methodRef)) {
            this._endpointInfo.set(methodRef, {});
        }
        const info = this._endpointInfo.get(methodRef);
        info[field] = true;
        info.$any = true;
    }

    initialize(): void {
        let hasApplication = false;
        reflectionPool.classes()
            .forEach(clazzRef => {
                const objectType = httpSigner.tag(clazzRef.creator);
                let hasController = false;

                clazzRef.docsAll<ValidatorStored>()
                    .forEach((docC, indexC) => {
                        const deco = docC.ins.identifier;
                        if (!deco.hasKeyword(IdValidator)) {
                            return;
                        }

                        const metadata = deco.getMetadata<ValidatorMetadata>();
                        const given = {
                            ins: docC.ins,
                            opt: docC.value.opt,
                            params: docC.value.params,
                            is: metadata.is,
                            validates: metadata.validates,
                            index: indexC,
                        } as ValidatorAddGiven;
                        switch (objectType) {
                            case 'http.app':
                                this._addApplication(given);
                                hasApplication = true;
                                break;
                            case 'http.controller':
                                this._addControllerClass(given);
                                hasController = true;
                                break;
                            // on dto
                            default:
                                this._addTypeClass(given);
                                break;
                        }
                    });

                clazzRef.listInstanceProperties()
                    .forEach(propPref => {
                        if (hasApplication) {
                            this._refreshEndpointInfo(propPref, 'application');
                        }
                        if (hasController && propPref.kind === 'method') {
                            this._refreshEndpointInfo(propPref, 'controller');
                        }
                        propPref.docsAll<ValidatorStored>()
                            .forEach((docM, indexM) => {
                                const deco = docM.ins.identifier;
                                if (!deco.hasKeyword(IdValidator)) {
                                    return;
                                }
                                const metadata = deco.getMetadata<ValidatorMetadata>();
                                const given = {
                                    ins: docM.ins,
                                    opt: docM.value.opt,
                                    params: docM.value.params,
                                    is: metadata.is,
                                    validates: metadata.validates,
                                    index: indexM,
                                } as ValidatorAddGiven;

                                let isEndpoint = false;
                                switch (objectType) {
                                    // on controller endpoint
                                    case 'http.controller':
                                        if (propPref.kind === 'method') {
                                            if (httpSigner.isExt(clazzRef.creator, propPref.name, 'methods') || httpSigner.is(propPref.callable, 'http.endpoint')) {
                                                this._addEndpointMethod(given);
                                                isEndpoint = true;
                                                this._refreshEndpointInfo(propPref, 'self');
                                            }
                                        }
                                        break;
                                    case 'http.app':
                                        break;
                                    // on dto field
                                    default:
                                        if (propPref.kind === 'field') {
                                            this._addDtoProperty(given);
                                        }
                                        break;
                                }

                                if (isEndpoint) {
                                    propPref.listParameters()
                                        .forEach(paramRef => {
                                            paramRef.docsAll<ValidatorStored>()
                                                .forEach((docP, indexP) => {
                                                    const deco = docP.ins.identifier;
                                                    if (!deco.hasKeyword(IdValidator)) {
                                                        return;
                                                    }
                                                    const metadata = deco.getMetadata<ValidatorMetadata>();
                                                    const given = {
                                                        ins: docP.ins,
                                                        opt: docP.value.opt,
                                                        params: docP.value.params,
                                                        is: metadata.is,
                                                        validates: metadata.validates,
                                                        index: indexP,
                                                    } as ValidatorAddGiven;
                                                    this._addEndpointParameter(given);
                                                    this._refreshEndpointInfo(propPref, 'parameter');
                                                });
                                        });
                                }
                            });
                    });
            });
    }

    endpointInfo(methodRef: PropertyReflectionLike): ValidatorEndpointInfo {
        return this._endpointInfo.get(methodRef) ?? {};
    }

    applicationItems(name: string): Array<ValidatorItem> {
        return this._get2d(this._applicationItems, name);
    }

    controllerItems(classRef: ClassReflectionLike, name: string): Array<ValidatorItem> {
        if (!this._controllerItems.has(classRef)) {
            return [];
        }
        return this._get2d(this._controllerItems.get(classRef), name);
    }

    endpointItems(methodRef: PropertyReflectionLike, name: string): Array<ValidatorItem> {
        if (!this._endpointItems.has(methodRef)) {
            return [];
        }
        return this._get2d(this._endpointItems.get(methodRef), name);
    }


    dtoPropertyItems(fieldRef: PropertyReflectionLike): Array<ValidatorItem> {
        if (!this._dtoPropertyItems.has(fieldRef)) {
            return [];
        }
        return this._dtoPropertyItems.get(fieldRef);
    }

    parameterItems(paramRef: ParameterReflectionLike): Array<ValidatorItem> {
        if (!this._parameterItems.has(paramRef)) {
            return [];
        }
        return this._parameterItems.get(paramRef);
    }

    typeClassItems(classRef: ClassReflectionLike): Array<ValidatorItem> {
        if (!this._typeClassItems.has(classRef)) {
            return [];
        }
        return this._typeClassItems.get(classRef);
    }

}

export const validatorPool: ValidatorPoolLike = new ValidatorPool();
