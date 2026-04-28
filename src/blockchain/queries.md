<script setup>
import WarningFatQuery from './WarningFatQuery.vue'
</script>

# Queries

Although much of the information about the state of the blockchain can be
obtained, as we've shown before, using an event subscriber and a filter to
narrow the scope of the events to those of interest, sometimes you need to
take a more direct approach. Enter _queries_.

Queries are small instruction-like objects that, when sent to an Iroha
peer, prompt a response with details from the current world state view.

This is not necessarily the only kind of information that is available on
the network, but it's the only kind of information that is _guaranteed_ to
be accessible on all networks.

For each deployment of Iroha, there might be other available information.
For example, the availability of telemetry data is up to the network
administrators. It's entirely their decision whether or not they want to
allocate processing power to track the work instead of using it to do the
actual work. By contrast, some functions are always required, e.g. having
access to your account balance.

The results of queries can be [sorted](#sorting), [paginated](#pagination)
and [filtered](#filters) peer-side all at once. Sorting is done
lexicographically on metadata keys. Filtering can be done on a variety of
principles, from domain-specific (individual IP address filter masks) to
sub-string methods like `begins_with` combined using logical operations.

## Try It on Taira

Taira exposes read-only query helpers over JSON for common resources. Use them
to practice pagination and response handling before wiring an SDK:

```bash
TAIRA_ROOT=https://taira.sora.org

curl -fsS "$TAIRA_ROOT/v1/accounts?limit=3" \
  | jq '{total, ids: [.items[].id]}'

curl -fsS "$TAIRA_ROOT/v1/domains?limit=3" \
  | jq '{total, domains: [.items[].id]}'

curl -fsS "$TAIRA_ROOT/v1/assets/definitions?limit=3" \
  | jq '{total, assets: [.items[] | {id, name, total_quantity}]}'
```

For app diagnostics, keep these smoke checks separate from signed transaction
tests. A read-only query failure usually points to endpoint availability,
network reachability, or route compatibility before it points to signer setup.

## Create a query

Use typed query builders from the SDK or CLI. For example, the current data
model exposes `FindAccounts` for listing accounts:

```rust
let query = FindAccounts;
```

Here is an example of a query that finds Alice's assets:

```rust
let alice_id = load_canonical_account_id_from_client_config()?;
let query = FindAssetsByAccountId::new(alice_id);
```

## Pagination

For singular queries and small iterable queries, you can use `client.request`
to submit a query and get the result in one go.

However, broad iterable queries such as `FindAccounts`, `FindAssets`, or
`FindBlocks` can return large result sets. Use pagination to reduce load on
the peer and client.

To construct a `Pagination`, you need to call
`client.request_with_pagination(query, pagination)`, where the `pagination`
is constructed as follows:

```rust
let starting_result: u32 = _;
let limit: u32 = _;
let pagination = Pagination::new(Some(starting_result), Some(limit));
```

## Filters

When you create a query, you can use a filter to only return the results
that match the specified filter.

Filters are query-specific. For example, account queries can be narrowed by
account identity or metadata, while asset queries can be narrowed by asset
definition, holder account, or domain projection. Use the SDK's typed query
builders where possible so the filter type matches the query output type.

## Sorting

Iroha can sort items with [metadata](/blockchain/metadata.md)
lexicographically if you provide a key to sort by during the construction
of the query. A typical use case is for accounts to have a `registered-on`
metadata entry, which, when sorted, allows you to view the account
registration history.

Sorting only applies to entities that have
[metadata](/blockchain/metadata.md), as the metadata key is used to
sort query results.

You can combine sorting with pagination and filters. Note that sorting is
an optional feature, most queries with pagination won't need it.

## Reference

Check the [list of existing queries](/reference/queries.md) for detailed information about them.
