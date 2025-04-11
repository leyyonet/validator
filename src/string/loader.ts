import {BetweenLength} from "./between-length";
import {CharAt} from "./char-at";
import {NotCharAt} from "./not-char-at";
import {Contains} from "./contains";
import {NotContain} from "./not-contain";
import {EndsWith} from "./ends-with";
import {NotEndWith} from "./not-end-with";
import {IndexOf} from "./index-of";
import {NotIndexOf} from "./not-index-of";
import {Matches} from "./matches";
import {NotMatch} from "./not-match";
import {MaxLength} from "./max-length";
import {MinLength} from "./min-length";
import {StartsWith} from "./starts-with";
import {NotStartWith} from "./not-start-with";
import {IsTrimmed} from "./is-trimmed";
import {MaxLines} from "./max-lines";
import {MinLines} from "./min-lines";
import {MaxWords} from "./max-words";
import {MinWords} from "./min-words";
import {Multiline} from "./multiline";
import {SingleLine} from "./single-line";
import {NoEmptyLines} from "./no-empty-lines";
import {NoTabs} from "./no-tabs";
import {NoWhitespace} from "./no-whitespace";

export const stringDecorators = [
    BetweenLength,
    CharAt, NotCharAt,
    Contains, NotContain,
    EndsWith, NotEndWith,
    IndexOf, NotIndexOf,
    IsTrimmed,
    Matches, NotMatch,
    MaxLength, MinLength,
    MaxLines, MinLines,
    MaxWords, MinWords,
    Multiline, SingleLine,
    NoEmptyLines, NoTabs, NoWhitespace,
    StartsWith, NotStartWith,
];