// @ts-check

module.exports = grammar({
  name: 'inko',
  word: $ => $.identifier,
  conflicts: $ => [
    [$.expr_index, $._block],
  ],
  rules: {
    program: $ => $._expr,
    lit_int: $ => choice(
      /0[xX][a-fA-F\d_]+/,
      /\d[\d_]*/,
    ),
    lit_float: $ => /\d[\d_]*\.[\d_]*[eE]?[+-]?[\d_]*/,
    lit_str: $ => choice($._lit_str_1, $._lit_str_2),
    _lit_str_1: $ => /'.*'/,
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
    escape: $ => /\\["'0\\enrt{]/,
    _expr: $ => choice(
      $._expr_group,
      $.expr_unary,
      $.expr_binary,
      $.expr_index,
      $.expr_return,
      $.expr_try,
      $.lit_arr,
      $.lit_str,
      $.lit_float,
      $.lit_int,
      prec(-1, $.identifier),
    ),
    _expr_group: $ => seq('(', $._expr, repeat(seq(',', $._expr)), optional(','), ')'),
    expr_unary: $ => prec(2, seq(choice(
      'ref', 'mut', 'recover', 'throw'
    ), $._expr)),
    expr_binary: $ => seq(prec.left(1, $._expr), choice('and', 'or', 'as'), prec.left(1, $._expr)),
    expr_index: $ => seq($._expr, '[', $._expr, ']', optional(prec.right(1, seq('=', $._expr)))),
    expr_return: $ => prec.right(2, seq('return', optional($._expr))),
    _expr_opt_curly: $ => choice(
      seq('{', $._expr, '}'),
      prec.left(1, $._expr),
    ),
    expr_try: $ => prec.left(1, seq('try', $._expr_opt_curly, optional($.expr_try_else))),
    expr_try_else: $ => seq('else', optional(seq(
      '(', $.identifier, optional($._type_ann), ')',
    )), $._block),
    identifier: $ => /[\w_][\w_]*/,
    type: $ => seq(/[A-Z_][\w_]*/, optional(seq(
      '[', $.type, repeat(seq(',', $.type)), optional(','), ']',
    ))),
    _type_ann: $ => seq(':', $.type),
    _block: $ => choice(
      seq('{', repeat($._expr), '}'),
      prec.left(1, $._expr),
    ),
  }
})
