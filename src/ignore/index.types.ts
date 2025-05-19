import {ClassReflectionLike, DecoIdLike, DecoInstanceLike, PropertyReflectionLike} from "@leyyo/core";
import {Func} from "@leyyo/common";

export interface ValidatorIgnoreLike {
    forApplication(): IgnoredItem;

    forController(clazzRef: ClassReflectionLike): IgnoredItem;

    forEndpoint(methodRef: PropertyReflectionLike): IgnoredItem;

    forType(clazzRef: ClassReflectionLike): IgnoredItem;

    addClass(clazz: ClassReflectionLike, item: IgnoreValidatorsOpt): void;

    addMethod(method: PropertyReflectionLike, item: IgnoreValidatorsOpt): void;
}

export interface IgnoredItem {
    all?: true;
    decorators: Array<DecoIdLike>;
}

export interface IgnoreValidatorsOpt {
    ins: DecoInstanceLike;
    all?: true;
    functions: Array<Func>;
    names: Array<string>;
}
