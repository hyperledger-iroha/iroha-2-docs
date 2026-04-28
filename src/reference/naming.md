# Naming Conventions

When you are naming accounts, domains, or assets, you have to keep in mind
the following conventions used in Iroha:

1. There is a number of reserved separators that are used for specific
   types of constructs:

   - `@` is reserved for account aliases and scoped account/public-key forms
   - `#` is reserved for asset definition aliases and asset balance literals
   - `::` is reserved for contract aliases
   - `.` is reserved for domain and dataspace qualification
   - `$` is reserved for trigger-scoped textual forms
   - `%` is reserved for validator-scoped textual forms

2. The maximum number of characters (including UTF-8 characters) a name can
   have is limited by two factors: `[0, u32::MAX]` and the currently
   allocated stack space.

## Try It on Taira

Resolve a public asset alias into its canonical asset definition ID:

```bash
curl -fsS https://taira.sora.org/v1/assets/aliases/resolve \
  -H 'content-type: application/json' \
  -d '{"alias":"usd#wonderland"}' \
  | jq '{alias, asset_definition_id, asset_name, status: .alias_binding.status}'
```

Compare that with the asset definition list:

```bash
curl -fsS 'https://taira.sora.org/v1/assets/definitions?limit=20' \
  | jq -r '.items[] | select(.alias != null) | [.alias, .id, .name] | @tsv'
```

The `#` character separates an asset alias from the domain context. Keep it out
of plain names unless you are intentionally writing an asset alias or asset
balance literal.
