# Naming Conventions

When you are naming accounts, domains, or assets, you have to keep in mind
the following conventions used in Iroha 2:

1. There is a number of reserved characters that are used for specific
   types of constructs:

   - `@` is reserved for `account@domain` constructs
   - `#` is reserved for `asset#domain` constructs
   - `$` is reserved for `trigger$domain` constructs
   - `%` is reserved for `validator%account` constructs

2. The maximum number of characters (including UTF-8 characters) a name can
   have is limited by two factors: `[0, u32::MAX]` and the currently
   allocated stack space.
