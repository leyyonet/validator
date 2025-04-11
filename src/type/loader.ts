import {IsArray} from "./is-array";
import {IsBool, IsBoolean} from "./is-boolean";
import {IsBuffer} from "./is-buffer";
import {IsDate, IsDatetime} from "./is-date";
import {IsInt, IsInteger} from "./is-integer";
import {IsMap} from "./is-map";
import {IsNumber} from "./is-number";
import {IsObject} from "./is-object";
import {IsRegexp} from "./is-regexp";
import {IsSet} from "./is-set";
import {IsSimpleDate} from "./is-simple-date";
import {IsString} from "./is-string";
import {IsTime} from "./is-time";
import {IsUuid} from "./is-uuid";

export const typeDecorators = [
    IsArray,
    IsBoolean, IsBool, IsBuffer,
    IsDate, IsDatetime,
    IsInteger, IsInt,
    IsMap,
    IsNumber,
    IsObject,
    IsRegexp,
    IsSet, IsSimpleDate, IsString,
    IsTime,
    IsUuid];