// @ts-check

/** Parses one or more `rule`s separated by `delim`, with optional trailing `delim`
  @param {Rule} rule
  @param {Rule} delim
*/
const separated = (rule, delim) => seq(rule, repeat(seq(delim, rule)), optional(delim))


/** Parses one or more `rule`s separated by `delim`.
  @param {Rule} rule
  @param {Rule} delim
*/
const sep_nonterm = (rule, delim) => seq(rule, repeat(seq(delim, rule)))

module.exports = grammar({
  name: 'inko',
  word: $ => $.identifier,
  extras: $ => [
    $.comment,
    /[\s\p{Zs}\uFEFF\u2060\u200B]/,
  ],
  conflicts: $ => [
    [$._expr_no_class, $._block_or],
    [$._type_named],
    [$._types],
    [$.expr_call],
  ],
  rules: {
    program: $ => repeat($._tlexpr),
    _tlexpr: $ => choice(
      $.def_const,
      $.def_method,
      $.def_class,
      $.import,
    ),
    def_const: $ => seq('let',
      optional('pub'),
      $.identifier,
      '=', $._expr,
    ),
    def_method: $ => seq('fn',
      optional('pub'),
      $.identifier,
      optional($.type_params),
      optional(field('args', $.method_args)),
      optional($._type_throws),
      optional($._type_return),
      $._block,
    ),
    method_args: $ => seq('(', optional(sep_nonterm($._method_arg, ',')), ')'),
    _method_arg: $ => seq($.identifier, $._type_ann),
    _type_throws: $ => field('throws', seq('!!', $._type)),
    _type_return: $ => field('return', seq('->', $._type)),
    type_params: $ => seq('[',
      repeat(seq(
        $.type_identifier,
        optional(seq(
          ':', sep_nonterm($._type_named, '+'),
        )),
      )),
      ']',
    ),
    def_class: $ => seq('class',
      optional('pub'),
      optional(choice('async', 'enum', 'builtin')),
      field('name', $.identifier),
      optional($.type_params),
      '{', repeat($._class_expr), '}'      
    ),
    _class_expr: $ => choice(
      $.class_method
    ),
    class_method: $ => seq('fn',
      optional('pub'),
      optional(choice('async', 'move', 'static', 'mut')),
      field('name', choice($.identifier, $.binop)),
      optional(field('args', $.method_args)),
      optional($._type_throws),
      optional($._type_return),
      $._block,
    ),
    import: $ => seq('import',
      sep_nonterm($.identifier, '::'),
      '::',
      choice(
        seq('(', sep_nonterm($._import_symbol, ','), ')'),
        $._import_symbol,
      )
    ),
    _import_symbol: $ => choice('*', "self", $.identifier),
    comment: () => /#.*/,
    lit_int: () => choice(
      /0[xX][a-fA-F\d_]+/,
      /\d[\d_]*/,
    ),
    lit_float: () => /\d[\d_]*\.[\d_]*[eE]?[+-]?[\d_]*/,
    lit_str: $ => choice($._lit_str_1, $._lit_str_2),
    _lit_str_1: () => /'.*'/,
    _lit_str_2: $ => choice(
      $._lit_str_2_start_end,
      seq(
        $._lit_str_2_start_mid,
        repeat(seq(
          field('expr', $._expr),
          $._lit_str_2_mid_mid,
        )),
        field('expr', $._expr),
        $._lit_str_2_mid_end,
      ),
    ),
    _lit_str_2_content: $ => choice($.escape, /[^"{]/),
    _lit_str_2_start_end: $ => seq('"', repeat($._lit_str_2_content), '"'),
    _lit_str_2_start_mid: $ => seq(
      '"', repeat($._lit_str_2_content), '{',
    ),
    _lit_str_2_mid_mid: $ => seq(
      '}', repeat($._lit_str_2_content), '{',
    ),
    _lit_str_2_mid_end: $ => seq(
      '}', repeat($._lit_str_2_content), '"',
    ),
    lit_arr: $ => seq('[', optional(seq(
      $._expr, repeat(seq(',', $._expr)), optional(','))
    ), ']'),
    lit_class: $ => seq($.identifier,
      '{', optional(separated($._class_assign, ',')), '}'
    ),
    _class_assign: $ => seq($.identifier, '=', $._expr),
    escape: () => /\\["'0\\enrt{]/,
    _expr: $ => choice($.lit_class, $._expr_no_class),
    _expr_no_class: $ => choice(
      $._expr_group,
      $.expr_unary,
      $.expr_unary_blk,
      $.expr_binary,
      $.expr_cast,
      $.expr_index,
      $.expr_return,
      $.expr_try,
      $.expr_try_panic,
      $.expr_binop,
      $.expr_closure,
      $.expr_define,
      $.expr_match,
      $.expr_kw,
      $.expr_if,
      $.expr_loop,
      $.expr_while,
      $.expr_call,
      $.lit_arr,
      $.lit_str,
      $.lit_float,
      $.lit_int,
      $._block,
    ),
    _expr_group: $ => seq('(', separated($._expr, ','), ')'),
    expr_unary: $ => prec(3, seq(choice(
      'ref', 'mut', 'throw'
    ), $._expr)),
    expr_unary_blk: $ => prec(3, seq(choice(
      'recover', 'async'
    ), $._expr)),
    expr_binary: $ => seq(prec.left($._expr), choice('and', 'or'), prec.left($._expr)),
    expr_cast: $ => seq($._expr, 'as', $._type),
    expr_index: $ => seq(prec(-1, $._expr), '[', $._expr, ']'),
    expr_return: $ => prec.right(seq('return', optional($._expr))),
    expr_try: $ => prec.left(seq('try', $._expr, optional($.expr_try_else))),
    expr_try_else: $ => prec(2, seq('else', optional(seq(
      '(', $.identifier, optional($._type_ann), ')',
    )), $._block_or)),
    expr_try_panic: $ => seq('try!', prec.right($._expr)),
    expr_call: $ => prec(-1, seq(
      optional(seq(
        $._expr, '.',
      )),
      $.identifier,         
      optional($.call_args),
    )),
    expr_define: $ => seq('let',
      optional('mut'),
      $.identifier,
      optional($._type_ann),
      '=',
      prec.left($._expr),
    ),
    call_args: $ => seq('(', optional($._call_args), ')'),
    _call_args: $ => choice(
      // one or more named args
      separated($.args_named, ','),
      // one or more pos-args, then zero or more named args
      seq($.args_pos, repeat(seq(',', $.args_pos)), repeat(seq(',', $.args_named)), optional(',')),
    ),
    args_pos: $ => $._expr,
    args_named: $ => seq($.identifier, ':', $._expr),
    expr_binop: $ => prec.right(seq($._expr, $.binop, $._expr)),
    binop: () => choice(
      '+', '-', '*', '/', '**', '&', '|', '^', '%', '>>', '<<',
      '=', ':=', '+=', '-=', '*=', '/=', '**=', '&=', '|=', '^=', '%=', '>>=', '<<='
    ),
    expr_closure: $ => seq('fn',
      optional('move'),
      optional(field('args', seq('(', separated($._closure_args, ','), ')'))),
      optional($._type_throws),
      optional($._type_return),
      $._block,
    ),
    _closure_args: $ => seq($.identifier, optional($._type_ann)),
    expr_kw: () => choice('self', 'true', 'false', 'nil', 'next', 'break'),
    expr_if: $ => prec.left(seq(
      $._if_branch,
      repeat(seq('else', $._if_branch)),
      optional(seq('else', $._block))
    )),
    _if_branch: $ => seq('if', $._expr_no_class, $._block),
    _block: $ => seq('{', repeat(prec.left($._expr)), '}'),
    expr_match: $ => seq('match',
      $._expr,
      '{', repeat($.case), '}',
    ),
    case: $ => seq('case', $._pat, '->', $._block_or),
    _pat: $ => choice($._pat_no_or, $.pat_or),
    _pat_no_or: $ => prec(1, choice(
      $.pat_str,
      $.lit_int,
      $.lit_float,
      $.pat_variant,
      $.pat_class,
      $.pat_tuple,
      prec(-1, $._expr),
    )),
    pat_str: $ => prec(1, choice($._lit_str_1, $._lit_str_2_start_end)),
    pat_variant: $ => seq($.type_identifier, '(', separated($._pat, ','), ')'),
    pat_class: $ => seq('{', separated($._pat_field, ','), '}'),
    pat_tuple: $ => seq('(', separated($._pat, ','), ')'),
    _pat_field: $ => seq($.identifier, '=', $._pat),
    pat_or: $ => prec(1, seq($._pat_no_or, repeat(seq('or', $._pat_no_or)))),
    expr_loop: $ => seq('loop', $._block),
    expr_while: $ => seq('while', $._expr, $._block),
    identifier: () => /[\w_@][\w\d_]*\??/,
    // identifier: () => token(seq(/[\w_@]/, repeat(/[\w\d_]/), optional('?'))),
    type_identifier: () => /[A-Z_][\w\d_]*/,
    _type_ann: $ => seq(':', $._type),
    _type: $ => choice(
      $.type_closure,
      $._type_named,
      $.type_unary,
      $._type_tuple,
    ),
    _type_named: $ => seq(
      $.type_identifier,
      optional(seq('[', $._types, ']')),
    ),
    type_unary: $ => seq(choice('ref', 'mut', 'uni'), $._type),
    type_closure: $ => prec.right(seq('fn',
      optional(field('args', $._type_tuple)),
      optional($._type_throws),
      optional($._type_return),
    )),
    _type_tuple: $ => seq('(', $._types, optional(','), ')'),
    _types: $ => separated($._type, ','),
    _block_or: $ => choice($._block, prec.left($._expr)),
  }
})
