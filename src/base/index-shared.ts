import {SD} from "@leyyo/scalar";
import {Dict, ExceptionClass} from "@leyyo/common";
import {DecoInstanceLike, DecoLike, ParameterReflectionLike, PropertyReflectionLike} from "@leyyo/core";

export namespace VD {
    /**
     * Options used to pass to validation decorators.
     */
    export interface Opt extends SD.Opt {
        /**
         * Error message to be used on validation fail.
         * Message can be either string or a error class.
         */
        error?: VD.ErrorAny;
    }

    export interface OptPro extends SD.OptPro {
        error?: VD.ErrorPro;
    }

    export type ErrorType = 'message' | 'class' | 'function' | 'both';
    export type ErrorAny = string | ExceptionClass | VD.ErrorLambda | VD.GivenError;
    export type ErrorLambda = (ctx: VD.Context, placeHolder: Dict) => Error;

    export interface ErrorPro {
        type: VD.ErrorType;
        message?: string;
        clazz?: ExceptionClass;
        fn?: VD.ErrorLambda;
    }

    export interface Context<C extends Dict = Dict, P extends VD.Placeholder = VD.Placeholder> extends SD.Context<C> {
        failed(placeholder: Partial<P>): Partial<P>;
    }

    /**
     * Options used to pass to validation decorators.
     */
    export interface Item<C extends Dict = Dict, P extends VD.Placeholder = VD.Placeholder, E = any> extends SD.Item<C, VD.OptPro> {
        is: VD.PassLambda;
        validates: VD.LambdaPro<C, P, E>;
        error: VD.ErrorPro;
    }

    export interface LambdaPro<C extends Dict = Dict, P extends VD.Placeholder = VD.Placeholder, E = any> {
        isAsync?: boolean;
        fn: VD.Lambda<C, P, E>;
    }

    export interface GivenError {
        message: string;
        clazz: ExceptionClass;
    }

    export interface AddGiven<C extends Dict = Dict, P extends VD.Placeholder = VD.Placeholder, E = any> {
        ins: DecoInstanceLike;
        opt: VD.OptPro;
        constraint: SD.ValueProTo<C>;
        error?: string | ExceptionClass | GivenError;
        is?: VD.PassLambda;
        validates: VD.Lambda<C, P, E>;
    }

    export type Lambda<C extends Dict = Dict, P extends VD.Placeholder = VD.Placeholder, E = any> =
        VD.LambdaSync<C, P, E>
        | VD.LambdaAsync<C, P, E>;
    export type LambdaSync<C extends Dict = Dict, P extends VD.Placeholder = VD.Placeholder, E = any> = (current: E, ctx: VD.Context<C, P>) => true | Partial<P>;
    export type LambdaAsync<C extends Dict = Dict, P extends VD.Placeholder = VD.Placeholder, E = any> = (current: E, ctx: VD.Context<C, P>) => Promise<true | Partial<P>>;

    export type PassLambda = (current: unknown) => boolean;

    export interface Placeholder {
        field: string;
        deco: string;
        current?: unknown;
    }

    export interface IgnoreItem {
        todo: boolean;
        decorators: Array<DecoLike>;
    }


    export interface PropertyItem {
        property: PropertyReflectionLike;
        items: Array<VD.Item>;
    }

    export interface ParameterItem {
        parameter: ParameterReflectionLike;
        items: Array<VD.Item>;
    }

}


export type BasicEqualityType = number | string | bigint;
export type BetWeenType = BasicEqualityType | Date;
export type BetweenTuple = [BetWeenType, BetWeenType];



