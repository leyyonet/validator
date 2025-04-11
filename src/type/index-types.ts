export interface TypeHelperLike {
    isValid<T>(isWeak: boolean, weakFn: TypeHelperLambda<T>, exactFn: TypeHelperLambda<boolean>): boolean;

    getType(current: any): string;
}

export type TypeHelperLambda<T> = () => T;