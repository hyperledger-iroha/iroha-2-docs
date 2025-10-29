# Choosing Between the Store and Metadata Assets

The `Store` and `metadata` assets allow for the storage of several parameters with different types and string keys. Despite the similarity, their use cases differ.

In most cases, you should only use `metadata` if you want something to use specific quantities and not be editable by other users. There are a few other practical considerations we'll discuss below.

You must use a `Store` asset if the data exists in the blockchain and a default number type is not applicable. It lets you record data sequences and works as a dictionary, where the keys are strings, while the values are  `Value` type instances that assume many types from `String` to `Ipv6Addr`.

Let’s discuss some use cases to make it more clear.

Let’s say, for example, you have a clinic. Here, generic user data, such as birthdays, can be added to `metadata`. The `Store` asset instances record the appointments, treatments suggested by the doctors, and medical test results.

Suppose you’re using Iroha for a large-scale IoT network to monitor the machines in your factory. In this case, you want to use the `Store` asset instances to record each manufacturing process on each manufacturing device so you can analyze the factors involved in the manufacturing process to understand the “health” of your machines and reduce the possibility of downtime by making repairs when needed.

Finally, imagine a network of organizations that trade specific goods or resources. Here, the `Store` assets would record every trade agreement, including the trade cost and a signature. This approach applies to many cases, starting with someone’s services and ending with NFTs.

There are also some pitfalls in choosing between metadata and `Store` assets.

Let's look at what happens when we define something in the metadata at the system level, such as the number of queries users can perform at a given time. Theoretically, this is correct since metadata is a key-value store. However, the default settings allow users to edit their metadata. In the development phase, this isn't a significant problem. However, once deployed, users could change the number of queries they can perform in this configuration, rendering any imposed restrictions ineffective.

With a new account schema, the user's metadata becomes global information: you cannot restrict access to it and say that this is related to a domain. On the other hand, the storage asset can belong to a single user. Some optimizations prevent domain-specific triggers from acting only on domain-specific data. Using metadata would cause these optimizations not to work. Instead, each user within a domain can get a copy of the metadata. This approach works like metadata, except that you'd give them memory access but not necessarily allow them to create new key-value pairs. They can see how many queries they have left, but they can't easily change that number with a simple statement.

Instead of thinking about data ownership, think about the location of the data and the function that data serves and the flow of information. So instead of storing in the user's metadata the number of queries they're allowed to make, the number of tokens they have created, or their NFTs, you should put each category in its own `Store` asset.

Think about what the smartcontract is supposed to do and how much extra data you must load and ignore. If your service participates using the metadata and another one does, and so on, the metadata size becomes enormous. Whenever you have queries related to it, you'll copy a lot of excess information and slow your code down. There's another catch: when the metadata belongs to an account, it essentially depends on another entity. When the said entity is removed or replaced, it requires glue code to handle the metadata transfer.

