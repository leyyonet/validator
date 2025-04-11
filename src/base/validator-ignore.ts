import {ClassReflectionLike, CoreReflectionLike, DecoLike, decorator, fqn, PropertyReflectionLike} from "@leyyo/core";
import {Arr, DeveloperException, Func, is, storage} from "@leyyo/common";
import {ValidatorHubLike, ValidatorIgnoreLike} from "./index-types";
import {VD} from "./index-shared";

export class ValidatorIgnore implements ValidatorIgnoreLike {
    private readonly ignoredClasses: Map<ClassReflectionLike, VD.IgnoreItem>;
    private readonly ignoredMethods: Map<PropertyReflectionLike, VD.IgnoreItem>;
    private readonly hub: ValidatorHubLike;

    constructor(hub: ValidatorHubLike) {
        this.hub = hub;
        this.ignoredClasses = storage.newMap('ValidatorPool.ignoredClasses');
        this.ignoredMethods = storage.newMap('ValidatorPool.ignoredMethods');
    }

    private _getIgnored<R extends CoreReflectionLike>(map: Map<R, VD.IgnoreItem>, ref: R): Array<DecoLike> {
        if (!map.has(ref)) {
            return [];
        }
        const item = map.get(ref);
        if (item.todo) {
            item.decorators = ref.decorators().filter(deco => deco.hasKeyword('validator'));
            item.todo = false;
        }
        return item.decorators;
    }

    private _ignore<R extends CoreReflectionLike>(map: Map<R, VD.IgnoreItem>, ref: R, decoList: true | Array<Func | string>): void {
        if (map.has(ref)) {
            throw new DeveloperException('reflection.already.ignored', {ref: ref.description, where: fqn.get(this)});
        }
        const item = {
            todo: false,
            decorators: [],
        } as VD.IgnoreItem;
        if (is.array(decoList)) {
            const decorators = (decoList as Arr).map(deco => decorator.fetchValue(deco, true));
            const wrongList = decorators.filter(deco => !deco.hasKeyword('validator'));
            if (wrongList.length > 0) {
                throw new DeveloperException('invalid.validator.decorators', {decorators: wrongList.map(deco => deco.name).join(', ')});
            }
            item.decorators = decorators.filter(deco => deco.hasKeyword('validator'));
            if (item.decorators.length > 0) {
                map.set(ref, item);
            }
        } else {
            item.todo = true;
            map.set(ref, item);
        }
    }

    listForClass(clazz: ClassReflectionLike): Array<DecoLike> {
        return this._getIgnored(this.ignoredClasses, clazz);
    }

    listForMethod(method: PropertyReflectionLike): Array<DecoLike> {
        return this._getIgnored(this.ignoredMethods, method);
    }

    addClass(clazz: ClassReflectionLike, decoList: true | Array<Func | string>): void {
        this._ignore(this.ignoredClasses, clazz, decoList);
    }

    addMethod(method: PropertyReflectionLike, decoList: true | Array<Func | string>): void {
        this._ignore(this.ignoredMethods, method, decoList);
    }

}