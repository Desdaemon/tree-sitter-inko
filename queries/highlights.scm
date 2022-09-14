(lit_str) @string
(lit_int) @constant.numeric.integer
(lit_float) @constant.numeric.float

(escape) @string.special
(comment) @comment

[
  "ref" "mut" "recover" "uni" "as" "throw" "return" "try" "try!" "fn" "else"
  "async" "move" "let" "next" "break" "if" "match" "case" "loop" "while" "pub"
  "class" "static" "builtin" "import" "trait" "enum" "impl" "for"
] @keyword

[ 
  (binop) "->" "!!"
] @operator

[
  "and" "or"
] @keyword.operator

[ 
  ":" "," "::" "."
] @punctuation.delimiter

[
  "(" ")"
] @punctuation

[ 
  "[" "]"
] @punctuation.bracket

[
  "true" "false"
] @constant.builtin.boolean

"nil" @constant.builtin

"self" @variable.builtin

((type_name) @type.builtin
  (#match? @type.builtin "^(Int|Float|Option|Result|List)"))
(type_name) @type
(type_identifier) @type

((identifier) @constant
  (#match? @constant "^[A-Z_][A-Z\d_]*$"))

(expr_call !receiver (identifier) @variable .)
(expr_call (identifier) @variable.other.member .)
(expr_call (identifier) @function)

(def_method
  name: (identifier) @function)
  
(class_method
  name: (identifier) @function !args !return)
(class_method
  name: (identifier) @variable.other.member !args)
(class_method
  name: (identifier) @function)
  
(namespace
  (identifier) @namespace)

((identifier) @variable
  (#is-not? local))

(identifier) @variable.parameter
(ERROR) @error
