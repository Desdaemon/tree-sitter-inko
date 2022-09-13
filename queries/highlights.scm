(lit_str) @string
(lit_str expr: _ @embedded)

[
  (lit_int)
  (lit_float)
] @constant

(escape) @string.special

"," @punctuation.delimiter

[
  "ref" "mut" "recover" "as" "throw" "return" "try"
] @keyword

[
  "="
] @operator

[
  "and" "or"
] @operator.keyword

[ "[" "]" ] @punctuation.bracket

(type) @type