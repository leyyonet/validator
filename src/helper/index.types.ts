import {CastClass} from "@leyyo/cast";

export interface ValidationHelperLike {
    isValidType(isWeak: boolean, clazz: CastClass, value: any): boolean;
    getExactType(data: any): string;
}
