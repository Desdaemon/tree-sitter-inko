((lit_str expr: (_) @injection.content)
  (#set! injection.include-children)
  (#set! injection.language "inko"))
  
((comment) @injection.content
  (#set! injection.language "comment"))