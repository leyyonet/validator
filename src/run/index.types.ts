import {ClassReflectionLike, PropertyReflectionLike} from "@leyyo/core";
import {ClassLike, Dict, ExceptionLike, Fnc} from "@leyyo/common";
import {Ctx} from "@leyyo/http";
import {Placeholder} from "../pool";
import {CallCurrent, CallParams} from "@leyyo/http-call";


export interface ValidatorRunLike {
    forClass(clazz: ClassReflectionLike | Fnc | ClassLike, ctx: Ctx, values: Dict, prevField?: string): Promise<Array<ExceptionLike>>;

    forMethod(methodRef: PropertyReflectionLike, ctx: Ctx, values: Array<any>, ignoredIndexes: Array<number>): Promise<Array<any>>;
}

export interface ValidatorCurrent<P extends CallParams = CallParams, H extends Placeholder = Placeholder> extends CallCurrent<P> {
    failed(placeholder?: Partial<H>): Partial<H>;

    ignored(): true;
}
