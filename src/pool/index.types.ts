import {ClassReflectionLike, DecoInstanceLike, ParameterReflectionLike, PropertyReflectionLike} from "@leyyo/core";
import {CallItem, CallOpt, CallOptPro, CallParams} from "@leyyo/call";
import {ValidatorCurrent} from "../run";
import {Dict, ExceptionClass} from "@leyyo/common";

export interface Placeholder {
    field: string;
    deco: string;
    data?: unknown;
}

export interface GivenError {
    message: string;
    clazz: ExceptionClass;
}

export type ValErrorType = 'message' | 'class' | 'function' | 'both';
export type ValErrorAny<P extends CallParams = CallParams> = string | ExceptionClass | ValErrorLambda<P> | GivenError;
export type ValErrorLambda<P extends CallParams = CallParams> = (current: ValidatorCurrent<P>, placeHolder: Dict) => Error;

export interface ValErrorPro<P extends CallParams = CallParams> {
    type: ValErrorType;
    message?: string;
    clazz?: ExceptionClass;
    fn?: ValErrorLambda<P>;
}

/**
 * Options used to pass to validation decorators.
 */
export interface ValidatorOpt<P extends CallParams = CallParams> extends CallOpt<P> {
    /**
     * Error message to be used on validation fail.
     * Message can be either string or a error class.
     */
    error?: ValErrorAny<P>;
}

export interface ValidatorOptExt<P extends CallParams = CallParams> extends ValidatorOpt<P> {
    selectedParameters: Array<string>;
}

export interface ValidatorOptPro<P extends CallParams = CallParams> extends CallOptPro<P> {
    error?: ValErrorPro<P>;
    selectedParameters: Array<string>;
}

// deco metadata
export interface ValidatorMetadata<P extends CallParams = CallParams, H extends Placeholder = Placeholder, E = any> {
    error?: string | ExceptionClass | GivenError;
    is?: ValidatorPassLambda<E>;
    validates: ValidatorLambdaAny<P, H, E>;
}

// deco instance value
export interface ValidatorStored<P extends CallParams = CallParams> {
    opt: ValidatorOptPro;
    params: P;
}

export interface ValidatorAddGiven<P extends CallParams = CallParams, H extends Placeholder = Placeholder, E = any> {
    ins: DecoInstanceLike;
    opt: ValidatorOptPro;
    params: P;
    index: number;
    error?: string | ExceptionClass | GivenError;
    is?: ValidatorPassLambda<E>;
    validates: ValidatorLambdaAny<P, H, E>;
}


export type ValidatorItemCollection<P extends CallParams = CallParams, H extends Placeholder = Placeholder, E = any> = Record<string, Array<ValidatorItem<P, H, E>>>;

export interface ValidatorItem<P extends CallParams = CallParams, H extends Placeholder = Placeholder, E = any> extends CallItem<P, ValidatorOptPro> {
    index: number;
    is: ValidatorPassLambda<E>;
    validates: ValidatorLambdaPro<P, H, E>;
    error: ValErrorPro<P>;
}


export interface ValidatorLambdaPro<P extends CallParams = CallParams, H extends Placeholder = Placeholder, E = any> {
    isAsync?: boolean;
    fn: ValidatorLambdaAny<P, H, E>;
}

export type ValidatorLambdaAny<P extends CallParams = CallParams, H extends Placeholder = Placeholder, E = any> =
    ValidatorLambdaSync<P, H, E>
    | ValidatorLambdaAsync<P, H, E>;
export type ValidatorLambdaSync<P extends CallParams = CallParams, H extends Placeholder = Placeholder, E = any> = (data: E, current: ValidatorCurrent<P, H>) => Partial<H> | true;
export type ValidatorLambdaAsync<P extends CallParams = CallParams, H extends Placeholder = Placeholder, E = any> = (data: E, current: ValidatorCurrent<P, H>) => Promise<Partial<H> | true>;

export type ValidatorPassLambda<E = any> = (data: E) => boolean;


export interface ValidatorParam<P = any> {
    params?: P;
    opt: ValidatorOpt;
}

export interface ValidatorEndpointInfo {
    controller?: true;
    application?: true;
    self?: true;
    parameter?: true;
    $any?: true;
}

export type BasicEqualityType = number | string | bigint;
export type BetWeenType = BasicEqualityType | Date;
export type BetweenTuple = [BetWeenType, BetWeenType];

export interface ValidatorPoolLike {

    endpointInfo(method: PropertyReflectionLike): ValidatorEndpointInfo;

    applicationItems(name: string): Array<ValidatorItem>;

    controllerItems(classRef: ClassReflectionLike, name: string): Array<ValidatorItem>;

    endpointItems(methodRef: PropertyReflectionLike, name: string): Array<ValidatorItem>;

    parameterItems(paramRef: ParameterReflectionLike): Array<ValidatorItem>;

    typeClassItems(classRef: ClassReflectionLike): Array<ValidatorItem>;

    dtoPropertyItems(fieldRef: PropertyReflectionLike): Array<ValidatorItem>;

    options<P extends CallParams = CallParams>(ins: DecoInstanceLike, given: any): ValidatorOptPro<P>;

    initialize(): void;
}
