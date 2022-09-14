type Rule = string | RegExp | Sealed

interface Sealed {
  [_: symbol]: never;
}

declare function seq(...rules: Rule[]): Rule;
declare function repeat(rule: Rule): Rule;
declare function repeat1(rule: Rule): Rule;
declare function choice(...rules: Rule[]): Rule;
declare function optional(rule: Rule): Rule;
declare function field(name: string, rule: Rule): Rule;
declare const token: {
  (rule: Rule): Rule
  /** Disallows whitespaces. */
  immediate(rule: Rule): Rule
}
declare function grammar<K extends string>(grammar: Grammar<K>): typeof grammar;
declare const prec: {
  (strength: number, rule: Rule): Rule
  left(rule: Rule): Rule
  left(strength: number, rule: Rule): Rule
  right(rule: Rule): Rule
  right(strength: number, rule: Rule): Rule
  dynamic(strength: number, rule: Rule): Rule
}

interface Grammar<K extends string> {
  name: string,
  rules: {
    [P in K]: ($: Record<K, Rule>) => Rule;
  }
  word?: ($: Record<K, Rule>) => Rule
  conflicts?: ($: Record<K, Rule>) => Rule[][],
  extras?: ($: Record<K, Rule>) => Rule[],
  [_: string]: any
}