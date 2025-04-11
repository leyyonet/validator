import {ClassReflectionLike, DecoInstanceLike, DecoLike, PropertyReflectionLike} from "@leyyo/core";
import {BasicType, ClassLike, Dict, ExceptionLike, Fnc, Func, OneOrMore} from "@leyyo/common";
import {SD} from "@leyyo/scalar";
import {VD} from "./index-shared";


export interface ValidatorHubLike {
    readonly pool: ValidatorPoolLike;
    readonly ignore: ValidatorIgnoreLike;
    readonly run: ValidatorRunLike;
}

export interface ValidatorPoolLike {
    hasClass(clazz: ClassReflectionLike): boolean;

    getClassProps(clazz: ClassReflectionLike): Map<string, VD.PropertyItem>;

    hasMethod(method: PropertyReflectionLike): boolean;

    getMethodParams(method: PropertyReflectionLike): Map<number, VD.ParameterItem>;

    hasSelf(clazz: ClassReflectionLike): boolean;

    getSelfItems(clazz: ClassReflectionLike): Array<VD.Item>;

    options<C extends Dict = Dict>(ins: DecoInstanceLike, given: any, primaryKey?: keyof C, primaryTypes?: OneOrMore<BasicType | 'array' | string>): SD.OptProExtracted<C, VD.OptPro>;

    add<C extends Dict = Dict, P extends VD.Placeholder = VD.Placeholder, E = any>(given: VD.AddGiven<C, P, E>): void;
}

export interface ValidatorIgnoreLike {
    listForClass(clazz: ClassReflectionLike): Array<DecoLike>;

    listForMethod(method: PropertyReflectionLike): Array<DecoLike>;

    addClass(clazz: ClassReflectionLike, decoList: true | Array<Func | string>): void;

    addMethod(method: PropertyReflectionLike, decoList: true | Array<Func | string>): void;
}

export interface ValidatorRunLike {
    forClass(clazz: ClassReflectionLike | Fnc | ClassLike, req: unknown, values: Dict, prevField?: string): Promise<Array<ExceptionLike>>;

    forMethod(method: PropertyReflectionLike, req: unknown, values: Array<any>, prevField?: string): Promise<Array<ExceptionLike>>;
}



