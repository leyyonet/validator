import {ClassReflection, ClassReflectionLike, fqn, PropertyReflectionLike, reflection} from "@leyyo/core";
import {
    ClassLike,
    commonError,
    Dict,
    Exception,
    ExceptionClass,
    ExceptionLike,
    Fnc,
    Func,
    is,
    leyyo
} from "@leyyo/common";
import {scalar, SD} from "@leyyo/scalar";
import {VD} from "./index-shared";
import {ValidatorHubLike, ValidatorRunLike} from "./index-types";

export class ValidatorRun implements ValidatorRunLike {
    private readonly hub: ValidatorHubLike;
    private readonly _IGNORED = [String, Number, Date, Boolean, Array, Object, Buffer] as Array<any>;

    constructor(hub: ValidatorHubLike) {
        this.hub = hub;
    }

    private _buildErrorMessage(message: string, placeholder: VD.Placeholder): string {
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
                    replaced = fqn.get(value);
                    break;
                case 'symbol':
                    replaced = value.description;
                    break;
                case 'object':
                    if (value) {
                        replaced = leyyo.secureJson(value);
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

    private _bindError<C extends Dict = Dict>(ctx: VD.Context<C>, item: VD.Item<C>, partial: Partial<VD.Placeholder>, causedBy?: Error): ExceptionLike {
        let clazz: ExceptionClass;
        let message: string;
        let exception: ExceptionLike;

        if (!is.object(partial)) {
            partial = {};
        }
        const placeholder = partial as VD.Placeholder;
        if (!placeholder.field) {
            placeholder.field = ctx.field;
        }
        if (!placeholder.deco) {
            placeholder.deco = ctx.ins.description;
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
                    exception = commonError.build(optError.fn(ctx, placeholder));
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

    private async _run<C extends Dict = Dict>(
        current: unknown,
        scopes: Array<SD.ScopePro>,
        ctx: VD.Context<C>,
        item: VD.Item<C>,
    ): Promise<Array<ExceptionLike>> {
        const errors = [] as Array<ExceptionLike>;
        const clonedScopes = [...scopes];
        const scope = clonedScopes.shift();
        let placeholder: boolean | Partial<VD.Placeholder>;
        switch (scope) {
            case scalar.SCOPE_SELF:
                if (item.is(current)) {
                    try {
                        if (item.keys.length > 0) {
                            if (item.hasLambda) {
                                if (item.isAsync) {
                                    await scalar.fetchConstraintAsync(item, ctx);
                                } else {
                                    scalar.fetchConstraint(item, ctx);
                                }
                            } else {
                                scalar.copyConstraint(item, ctx);
                            }
                        } else {
                            ctx.constraint = {} as SD.ValueProFrom<C>;
                        }
                        if (item.validates.isAsync) {
                            placeholder = await (item.validates.fn as VD.LambdaAsync<C>)(current, ctx);
                        } else {
                            placeholder = (item.validates.fn as VD.LambdaSync<C>)(current, ctx);
                        }
                        if (placeholder !== true) {
                            errors.push(this._bindError(ctx, item, placeholder));
                        }
                    } catch (e) {
                        errors.push(this._bindError(ctx, item, {}, e));
                    }
                }
                break;
            case scalar.SCOPE_ARR_VAL:
                if (current instanceof Set) {
                    if (current.size > 0) {
                        const promises = [] as Array<Promise<Array<ExceptionLike>>>;
                        current.forEach(currentItem => {
                            promises.push(this._run(currentItem, clonedScopes, ctx, item));
                        });
                        const exceptionArrays = await Promise.all(promises);
                        exceptionArrays.forEach(exceptions => {
                            errors.push(...exceptions);
                        });
                    }
                } else if (Array.isArray(current)) {
                    if (current.length > 0) {
                        const promises = [] as Array<Promise<Array<ExceptionLike>>>;
                        current.forEach(currentItem => {
                            promises.push(this._run(currentItem, clonedScopes, ctx, item));
                        });
                        const exceptionArrays = await Promise.all(promises);
                        exceptionArrays.forEach(exceptions => {
                            errors.push(...exceptions);
                        });
                    }
                }
                break;
            case scalar.SCOPE_REC_KEY:
                if (current instanceof Map) {
                    if (current.size > 0) {
                        const promises = [] as Array<Promise<Array<ExceptionLike>>>;
                        Array.from(current.keys()).forEach(currentItem => {
                            promises.push(this._run(currentItem, clonedScopes, ctx, item));
                        });
                        const exceptionArrays = await Promise.all(promises);
                        exceptionArrays.forEach(exceptions => {
                            errors.push(...exceptions);
                        });
                    }
                } else if (is.object(current)) {
                    const keys = Object.keys(current);
                    if (keys.length > 0) {
                        const promises = [] as Array<Promise<Array<ExceptionLike>>>;
                        keys.forEach(currentItem => {
                            promises.push(this._run(currentItem, clonedScopes, ctx, item));
                        });
                        const exceptionArrays = await Promise.all(promises);
                        exceptionArrays.forEach(exceptions => {
                            errors.push(...exceptions);
                        });
                    }
                }
                break;
            case scalar.SCOPE_REC_VAL:
                if (current instanceof Map) {
                    if (current.size > 0) {
                        const promises = [] as Array<Promise<Array<ExceptionLike>>>;
                        Array.from(current.values()).forEach(currentItem => {
                            promises.push(this._run(currentItem, clonedScopes, ctx, item));
                        });
                        const exceptionArrays = await Promise.all(promises);
                        exceptionArrays.forEach(exceptions => {
                            errors.push(...exceptions);
                        });
                    }
                } else if (is.object(current)) {
                    const values = Object.values(current);
                    if (values.length > 0) {
                        const promises = [] as Array<Promise<Array<ExceptionLike>>>;
                        values.forEach(currentItem => {
                            promises.push(this._run(currentItem, clonedScopes, ctx, item));
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

    private _checkDeepTypes(fn: Func): boolean {
        return fn && !this._IGNORED.includes(fn);
    }

    async forClass(clazz: ClassReflectionLike | Fnc | ClassLike, req: unknown, values: Dict, prevField?: string): Promise<Array<ExceptionLike>> {
        if (this._IGNORED.includes(clazz)) {
            return [];
        }
        let ref: ClassReflectionLike;
        if (clazz instanceof ClassReflection) {
            ref = clazz;
        } else {
            ref = reflection.fetchValue(clazz, false);
            if (!ref) {
                this._IGNORED.push(clazz);
                return [];
            }
        }
        if (!this.hub.pool.hasClass(ref)) {
            this._IGNORED.push(ref.creator);
            return [];
        }
        if (!is.object(values)) {
            values = {};
        }
        const classProps = this.hub.pool.getClassProps(ref);

        const ignoredDecorators = this.hub.ignore.listForClass(ref);
        const errors = [];

        // for self
        if (this.hub.pool.hasSelf(ref)) {
            const current = values;
            const field = prevField;
            for (const item of this.hub.pool.getSelfItems(ref)) {
                if (ignoredDecorators.includes(item.deco)) {
                    continue;
                }
                const {opt, constraint, ins, deco} = item;
                const ctx = {req, field, constraint, ins, deco} as VD.Context;
                ctx.failed = p => p;
                try {
                    if (opt.when.isAsync) {
                        if (!(await (opt.when.fn as SD.WhenAsync)(ctx))) {
                            continue;
                        }
                    } else {
                        if ((opt.when.fn as SD.WhenSync)(ctx)) {
                            continue;
                        }
                    }
                    errors.push(...(await this._run(current, opt.scopes, ctx, item)));
                } catch (e) {
                    errors.push(this._bindError(ctx, item, {}, e));
                }
            }
        }
        // for properties
        for (const [f, propItem] of classProps.entries()) {
            const current = values[f];
            const field = prevField ? `${prevField}.${f}` : f;

            for (const item of propItem.items) {
                if (ignoredDecorators.includes(item.deco)) {
                    continue;
                }
                const {opt, constraint, ins, deco} = item;
                const ctx = {req, field, constraint, ins, deco} as VD.Context;
                ctx.failed = p => p;
                try {
                    if (opt.when.isAsync) {
                        if (!(await (opt.when.fn as SD.WhenAsync)(ctx))) {
                            continue;
                        }
                    } else {
                        if ((opt.when.fn as SD.WhenSync)(ctx)) {
                            continue;
                        }
                    }
                    errors.push(...(await this._run(current, opt.scopes, ctx, item)));
                } catch (e) {
                    errors.push(this._bindError(ctx, item, {}, e));
                }
            }
            if (this._checkDeepTypes(propItem.property.type)) {
                errors.push(...(await this.forClass(propItem.property.type as Fnc, req, current, field)));
            }
        }
        return errors;
    }

    async forMethod(method: PropertyReflectionLike, req: unknown, values: Array<any>, prevField?: string): Promise<Array<ExceptionLike>> {
        if (!is.array(values)) {
            values = [];
        }
        if (values.length < method.listParameters().length) {
            const diff = method.listParameters().length - values.length;
            for (let i = 0; i < diff; i++) {
                values.push(undefined);
            }
        }
        if (!this.hub.pool.hasMethod(method)) {
            return [];
        }
        const methodParams = this.hub.pool.getMethodParams(method);

        const errors = [];
        const ignoredDecorators = this.hub.ignore.listForMethod(method);
        const ignoredDecoratorsParent = this.hub.ignore.listForClass(method.clazz);
        for (const [index, paramItem] of methodParams.entries()) {
            let current = values[index];
            const field = prevField ? `${prevField}.${paramItem.parameter.name}` : paramItem.parameter.name;
            for (const item of paramItem.items) {
                if (ignoredDecorators.includes(item.deco) || ignoredDecoratorsParent.includes(item.deco)) {
                    continue;
                }

                const {opt, constraint, ins, deco} = item;
                const ctx = {req, field, constraint, ins, deco} as VD.Context;
                ctx.failed = p => p;
                try {
                    if (opt.when.isAsync) {
                        if (!(await (opt.when.fn as SD.WhenAsync)(ctx))) {
                            continue;
                        }
                    } else {
                        if ((opt.when.fn as SD.WhenSync)(ctx)) {
                            continue;
                        }
                    }
                    errors.push(...(await this._run(current, opt.scopes, ctx, item)));
                } catch (e) {
                    errors.push(this._bindError(ctx, item, {}, e));
                }
            }
            if (this._checkDeepTypes(paramItem.parameter.type)) {
                errors.push(...(await this.forClass(paramItem.parameter.type as Fnc, req, current, field)));
            }
        }
        return errors;
    }

}