(lit_str) @string
(lit_int) @constant.numeric.integer
(lit_float) @constant.numeric.float

(escape) @string.special
(comment) @comment

[
  "ref" "mut" "recover" "uni" "as" "throw" "return" "try" "try!" "fn" "else"
  "async" "move" "let" "next" "break" "if" "match" "case" "loop" "while" "pub"
  "class" "static" "builtin" "import"
] @keyword

(binop) @operator

[
  "and" "or"
] @keyword.operator

[ 
  ":" "," "::"
] @punctuation.delimiter

[
  "(" ")"
] @punctuation

[ 
  "[" "]"
] @punctuation.bracket

((type_identifier) @type.builtin
  (#match? @type.builtin "^(Int|Float|Option|Result|List)$"))
(type_identifier) @type
(ERROR) @error

((identifier) @constant
  (#match? @constant "^[A-Z_][A-Z\d_]*$"))

(expr_call (identifier) @variable .)
(expr_call (identifier) @function)

(def_method
  . (identifier) @function)

(def_class name: (identifier) @type)
  
(class_method
  name: (identifier) @function)

[
  "true" "false"
] @constant.builtin.boolean

"nil" @constant.builtin

"self" @variable.builtin

((identifier) @variable
  (#is-not? local))

(identifier) @variable.parameter