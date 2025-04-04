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

## Create a query

Use `QueryBox` to construct a query. For example, a query to find all
accounts would be created like this:

```rust
let query = QueryBox::FindAllAccounts(FindAllAccounts {});
```

Here is an example of a query that finds Alice's assets:

```rust
let alice_id =
    AccountId::from_str("alice@wonderland")?;
let query = QueryBox::FindAssetsByAccountId(
    FindAssetsByAccountId::new(alice_id)
  );
```

## Pagination

For both a `Vec<Z>` and just `Z` as the return type, you can use
`client.request(query)` to submit a query and get the full result in one
go.

However, some queries, particularly the ones with "All" in their names, can
return exorbitant amounts of data. As such, we highly recommend you
consider _pagination_ to reduce the load on the system.

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

<!-- TODO: add example -->

## Sorting

Iroha 2 can sort items with [metadata](/blockchain/metadata.md)
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
