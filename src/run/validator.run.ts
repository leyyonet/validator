import {
    ClassReflection,
    ClassReflectionLike,
    Fqn,
    fqnHandler,
    PropertyReflectionLike,
    reflectionPool
} from "@leyyo/core";
import {
    $dev,
    $err,
    $is,
    $repo,
    ClassLike,
    Dict,
    Exception,
    ExceptionClass,
    ExceptionLike,
    Fnc,
    Func, MultipleException,
    Obj
} from "@leyyo/common";
import {ValidatorRunLike, ValidatorCurrent} from "./index.types";
import {
    callItem,
    callOption,
    CallOptionProcessorSecure,
    CallParams,
    CallScopePro,
    CallWhenAsync,
    CallWhenSync
} from "@leyyo/http-call";
import {FQN_PCK} from "../internal";
import {Ctx} from "@leyyo/http";
import {validatorIgnore} from "../ignore";
import {
    Placeholder,
    ValidatorItem,
    ValidatorLambdaAsync,
    ValidatorLambdaSync,
    ValidatorOptPro,
    validatorPool
} from "../pool";

@Fqn(FQN_PCK)
class ValidatorRun implements ValidatorRunLike {
    private readonly _IGNORED = [String, Number, Date, Boolean, BigInt, Array, Object, Buffer, RegExp] as Array<any>;
    private readonly callOptionSecure: CallOptionProcessorSecure;
    private readonly cachedProperties: Map<ClassReflectionLike, Array<PropertyReflectionLike>>;

    constructor() {
        this.callOptionSecure = callOption.$secure;
        this.cachedProperties = $repo.newMap(FQN_PCK, 'cachedProperties');
    }


    private _buildErrorMessage(message: string, placeholder: Partial<Placeholder>): string {
        for (const [key, value] of Object.entries(placeholder)) {
            let replaced: string;
            switch (typeof value) {
                case 'string':
                    replaced = value;
                    break;
                case "number":
                case "bigint":
                    replaced = value.toString(10);
                    break;
                case "boolean":
                    replaced = value ? 'true' : 'false';
                    break;
                case "function":
                    replaced = fqnHandler.get(value);
                    break;
                case 'symbol':
                    replaced = value.description;
                    break;
                case 'object':
                    if (value) {
                        replaced = $dev.secureJson(value, true);
                    } else {
                        replaced = '?';
                    }
                    break;
                case "undefined":
                    replaced = '?';
                    break;
                default:
                    replaced = '?';
                    break;
            }
            message = message.replace(new RegExp("{{\\s*" + key + "\\s*}}", "g"), replaced);
        }
        // todo
        return message;
    }

    private _bindError<P extends CallParams = CallParams>(current: ValidatorCurrent<P>, item: ValidatorItem<P>, placeholder: Partial<Placeholder>, causedBy?: Error): ExceptionLike {
        let clazz: ExceptionClass;
        let message: string;
        let exception: ExceptionLike;

        if (!$is.object(placeholder)) {
            placeholder = {};
        }
        if (!placeholder.field) {
            placeholder.field = current.field;
        }
        if (!placeholder.deco) {
            placeholder.deco = current.ins.description;
        }

        const optError = item.opt.error;
        const itemError = item.error;
        switch (optError?.type) {
            case "message":
                message = optError.message;
                if (itemError?.clazz) {
                    clazz = itemError?.clazz;
                }
                break;
            case "class":
                clazz = optError.clazz;
                if (itemError?.message) {
                    message = itemError?.message;
                }
                break;
            case "both":
                clazz = optError.clazz;
                message = optError.message;
                break;
            case 'function':
                try {
                    exception = $err.build(optError.fn(current, placeholder));
                } catch (e) {
                    console.warn('unexpected'); // todo
                }
                break;
            default:
                switch (itemError?.type) {
                    case "message":
                        message = itemError.message;
                        break;
                    case "class":
                        clazz = itemError.clazz;
                        break;
                    case "both":
                        message = itemError.message;
                        clazz = itemError.clazz;
                        break;
                }
                break;
        }
        if (!message) {
            message = '{{field}} failed => {{placeholder}}';
        }
        if (!exception) {
            if (!clazz) {
                clazz = Exception;
            }
            exception = new clazz(this._buildErrorMessage(message, placeholder));
        }
        if (causedBy) {
            exception.causedBy(causedBy);
        }
        for (const [k, v] of Object.entries(placeholder)) {
            exception.params[k] = v;
        }
        return exception;
    }

    private async _run<P extends CallParams = CallParams>(
        data: unknown,
        scopes: Array<CallScopePro>,
        current: ValidatorCurrent<P>,
        item: ValidatorItem<P>,
    ): Promise<Array<ExceptionLike>> {
        const errors = [] as Array<ExceptionLike>;
        const clonedScopes = [...scopes];
        const scope = clonedScopes.shift();
        switch (scope) {
            case this.callOptionSecure.$SCOPE_SELF:
                if (item.is(data)) {
                    try {
                        let placeholder: Partial<Placeholder> | true;
                        if (item.validates.isAsync) {
                            placeholder = await (item.validates.fn as ValidatorLambdaAsync<P>)(data, current);
                        } else {
                            placeholder = (item.validates.fn as ValidatorLambdaSync<P>)(data, current);
                        }
                        if (placeholder !== true) {
                            errors.push(this._bindError(current, item, placeholder));
                        }
                    } catch (e) {
                        errors.push(this._bindError(current, item, {}, e));
                    }
                }
                break;
            case this.callOptionSecure.$SCOPE_ARR_VAL:
                if (data instanceof Set) {
                    if (data.size > 0) {
                        const promises = [] as Array<Promise<Array<ExceptionLike>>>;
                        data.forEach(currentItem => {
                            promises.push(this._run(currentItem, clonedScopes, current, item));
                        });
                        const exceptionArrays = await Promise.all(promises);
                        exceptionArrays.forEach(exceptions => {
                            errors.push(...exceptions);
                        });
                    }
                } else if (Array.isArray(data)) {
                    if (data.length > 0) {
                        const promises = [] as Array<Promise<Array<ExceptionLike>>>;
                        data.forEach(currentItem => {
                            promises.push(this._run(currentItem, clonedScopes, current, item));
                        });
                        const exceptionArrays = await Promise.all(promises);
                        exceptionArrays.forEach(exceptions => {
                            errors.push(...exceptions);
                        });
                    }
                }
                break;
            case this.callOptionSecure.$SCOPE_REC_KEY:
                if (data instanceof Map) {
                    if (data.size > 0) {
                        const promises = [] as Array<Promise<Array<ExceptionLike>>>;
                        Array.from(data.keys()).forEach(currentItem => {
                            promises.push(this._run(currentItem, clonedScopes, current, item));
                        });
                        const exceptionArrays = await Promise.all(promises);
                        exceptionArrays.forEach(exceptions => {
                            errors.push(...exceptions);
                        });
                    }
                } else if ($is.bareObject(data)) {
                    const keys = Object.keys(data);
                    if (keys.length > 0) {
                        const promises = [] as Array<Promise<Array<ExceptionLike>>>;
                        keys.forEach(currentItem => {
                            promises.push(this._run(currentItem, clonedScopes, current, item));
                        });
                        const exceptionArrays = await Promise.all(promises);
                        exceptionArrays.forEach(exceptions => {
                            errors.push(...exceptions);
                        });
                    }
                }
                break;
            case this.callOptionSecure.$SCOPE_REC_VAL:
                if (data instanceof Map) {
                    if (data.size > 0) {
                        const promises = [] as Array<Promise<Array<ExceptionLike>>>;
                        Array.from(data.values()).forEach(currentItem => {
                            promises.push(this._run(currentItem, clonedScopes, current, item));
                        });
                        const exceptionArrays = await Promise.all(promises);
                        exceptionArrays.forEach(exceptions => {
                            errors.push(...exceptions);
                        });
                    }
                } else if ($is.bareObject(data)) {
                    const values = Object.values(data);
                    if (values.length > 0) {
                        const promises = [] as Array<Promise<Array<ExceptionLike>>>;
                        values.forEach(currentItem => {
                            promises.push(this._run(currentItem, clonedScopes, current, item));
                        });
                        const exceptionArrays = await Promise.all(promises);
                        exceptionArrays.forEach(exceptions => {
                            errors.push(...exceptions);
                        });
                    }
                }
                break;
        }
        return errors;
    }

    private _fromFieldCache(classRef: ClassReflectionLike): Array<PropertyReflectionLike> {
        if (!this.cachedProperties.has(classRef)) {
            this.cachedProperties.set(classRef, classRef.listInstanceProperties({kind: 'field'}));
        }
        return this.cachedProperties.get(classRef);
    }

    private _checkDeepTypes(fn: Func): boolean {
        return fn && !this._IGNORED.includes(fn);
    }

    private async _runWhen(opt: ValidatorOptPro, current: ValidatorCurrent): Promise<boolean | Error> {
        try {
            if (opt.when.isAsync) {
                return await (opt.when.fn as CallWhenAsync)(current);
            }
            return (opt.when.fn as CallWhenSync)(current);
        } catch (e) {
            return e;
        }

    }

    protected _extendCurrent(current: ValidatorCurrent): void {
        current.failed = value => value ?? {};
    }

    async forClass(clazz: ClassReflectionLike | Fnc | ClassLike, ctx: Ctx, value: Dict, prevField?: string): Promise<Array<ExceptionLike>> {
        const result = [] as Array<ExceptionLike>;
        if (this._IGNORED.includes(clazz)) {
            return result;
        }
        let ref: ClassReflectionLike;
        if (clazz instanceof ClassReflection) {
            ref = clazz;
        } else {
            ref = reflectionPool.get(clazz, false);
            if (!ref) {
                this._IGNORED.push(clazz);
                return result;
            }
        }
        const typeInfo = validatorIgnore.forType(ref);
        if (typeInfo.all) {
            this._IGNORED.push(ref.creator);
            return result;
        }

        if (!$is.object(value)) {
            value = {};
        }

        const ignoredDecorators = typeInfo.decorators;

        // for self
        const selfItems = validatorPool.typeClassItems(ref);
        for (const item of selfItems) {
            if (ignoredDecorators.includes(item.deco)) {
                continue;
            }
            const current = await callItem.buildCurrent(ctx, prevField, item) as ValidatorCurrent;
            this._extendCurrent(current);

            const whenResult = await this._runWhen(item.opt, current);
            if (whenResult === true) {
                result.push(...await this._run(value, item.opt.scopes, current, item));
            } else if (whenResult !== false) {
                result.push(this._bindError(current, item, {}, whenResult));
            }
        }

        // for properties
        for (const fieldRef of this._fromFieldCache(ref)) {
            const f = fieldRef.name;
            const field = prevField ? `${prevField}.${f}` : f;

            const propItems = validatorPool.dtoPropertyItems(fieldRef);
            for (const item of propItems) {
                if (ignoredDecorators.includes(item.deco)) {
                    continue;
                }

                const current = await callItem.buildCurrent(ctx, field, item) as ValidatorCurrent;
                this._extendCurrent(current);

                const whenResult = await this._runWhen(item.opt, current);
                if (whenResult === true) {
                    result.push(...await this._run(value[f], item.opt.scopes, current, item));
                } else if (whenResult !== false) {
                    result.push(this._bindError(current, item, {}, whenResult));
                }
            }
            if (this._checkDeepTypes(fieldRef.type)) {
                result.push(...await this.forClass(fieldRef.type as Fnc, ctx, value[f], field));
            }
            const runtimeValue = value[f];
            if ($is.object(runtimeValue)) {
                const runtimeType = (runtimeValue as Obj).constructor;
                if (runtimeType !== fieldRef.type && this._checkDeepTypes(runtimeType)) {
                    result.push(...await this.forClass(runtimeType as Fnc, ctx, runtimeValue, field));
                }
            }
        }
        return result;
    }

    async forMethod(methodRef: PropertyReflectionLike, ctx: Ctx, values: Array<any>, ignoredIndexes: Array<number>): Promise<Array<any>> {
        const errors = [] as Array<ExceptionLike>;

        if (!Array.isArray(values)) {
            values = [];
        }
        const paramRefList = methodRef.listParameters();
        if (values.length < paramRefList.length) {
            const diff = paramRefList.length - values.length;
            for (let i = 0; i < diff; i++) {
                values.push(undefined);
            }
        }

        const info = validatorPool.endpointInfo(methodRef);
        if (!info.$any) {
            return values;
        }

        const appInfo = validatorIgnore.forApplication();
        if (appInfo.all) {
            return values;
        }
        const controllerInfo = validatorIgnore.forController(methodRef.clazz);
        if (controllerInfo.all) {
            return values;
        }
        const selfInfo = validatorIgnore.forEndpoint(methodRef);
        if (selfInfo.all) {
            return values;
        }
        const ignoredDecorators = [...appInfo.decorators, ...controllerInfo.decorators, ...selfInfo.decorators];

        for (const paramRef of paramRefList) {
            if (ignoredIndexes.includes(paramRef.index)) {
                continue;
            }
            const items = validatorPool.parameterItems(paramRef);
            items.push(
                ...validatorPool.applicationItems(paramRef.name),
                ...validatorPool.controllerItems(methodRef.clazz, paramRef.name),
                ...validatorPool.endpointItems(methodRef, paramRef.name)
            );

            let field: string;
            if (paramRef.name) {
                field = paramRef.name;
            } else {
                field = `#${paramRef.index}`;
            }
            for (const item of items) {
                if (ignoredDecorators.includes(item.deco)) {
                    continue;
                }
                const current = await callItem.buildCurrent(ctx, field, item) as ValidatorCurrent;
                this._extendCurrent(current);

                const whenResult = await this._runWhen(item.opt, current);
                if (whenResult === true) {
                    errors.push(...await this._run(values[paramRef.index], item.opt.scopes, current, item));
                } else if (whenResult !== false) {
                    errors.push(this._bindError(current, item, {}, whenResult));
                }
            }
            if (this._checkDeepTypes(paramRef.type)) {
                errors.push(...await this.forClass(paramRef.type as Fnc, ctx, values[paramRef.index], field));
            }
            const runtimeValue = values[paramRef.index];
            if ($is.object(runtimeValue)) {
                const runtimeType = (runtimeValue as Obj).constructor;
                if (runtimeType !== paramRef.type && this._checkDeepTypes(runtimeType)) {
                    errors.push(...await this.forClass(runtimeType as Fnc, ctx, runtimeValue, field));
                }
            }
        }
        if (errors.length < 1) {
            return values;
        }
        if (errors.length === 1) {
            throw errors[0];
        }
        throw new MultipleException(...errors);
    }
}

export const validatorRun: ValidatorRunLike = new ValidatorRun();
