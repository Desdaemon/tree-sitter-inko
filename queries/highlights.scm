(lit_str) @string
(lit_str expr: (identifier) @embedded)

[
  (lit_int)
  (lit_float)
] @constant

(escape) @string.special

"," @punctuation.delimiter

[
  "ref" "mut" "recover" "uni" "as" "throw" "return" "try" "fn" "else"
] @keyword

[
  "="
] @operator

[
  "and" "or"
] @operator.keyword

[ "[" "]" ] @punctuation.bracket

(type_identifier) @type
(ERROR) @error