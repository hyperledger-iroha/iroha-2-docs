# Kotlin/Java Guide

## 1. Iroha 2 Client Setup

In this part we shall cover the main things to look out for if you want to
use Iroha 2 in your Kotlin application. Instead of providing the complete
basics, we shall assume knowledge of the most widely used concepts, explain
the unusual, and provide some instructions for creating your own Iroha
2-compatible client.

We assume that you know how to create a new package and have basic
understanding of the fundamental Kotlin code. Specifically, we shall assume
that you know how to build and deploy your program on the target platforms.
To clone Iroha 2 JVM compatible SDKs, you can use [Iroha Java](https://github.com/hyperledger-iroha/iroha-java).

Without further ado, here's a part of an example `build.gradle.kts` file,
specifically, the `plugins`, `repositories` and `dependencies` sections:

```kotlin
plugins {
    kotlin("jvm") version "1.6.10"
    application
}

group = "jp.co.soramitsu"
version = "1.0-SNAPSHOT"

repositories {
    mavenCentral()
    maven(url = "https://jitpack.io")
}

dependencies {
    val iroha2Ver by System.getProperties()

    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.6.0")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core-jvm:1.6.0")

    api("com.github.hyperledger.iroha-java:admin-client:SNAPSHOT")
    implementation("com.github.hyperledger.iroha-java:model:SNAPSHOT")
    implementation("com.github.hyperledger.iroha-java:block:SNAPSHOT")

    implementation("net.i2p.crypto:eddsa:0.3.0")
    implementation("org.bouncycastle:bcprov-jdk15on:1.65")
    implementation("com.github.multiformats:java-multihash:1.3.0")
}
```

You **should** replace the SNAPSHOT in the above configuration with the
latest `iroha-java` snapshot.

Snapshot versions match the Git commits. To get the latest snapshot, simply
visit the
[`iroha-java`](https://github.com/hyperledger-iroha/iroha-java/tree/iroha2-dev)
repository on the `iroha-2-dev` branch and copy the short hash of the last
commit on the main page.

![](/img/iroha_java_hash.png)

You can also check the
[commit history](https://github.com/hyperledger-iroha/iroha-java/commits/iroha2-dev)
and copy the commit hash of a previous commit.

![](/img/iroha_java_commits.png)

This will give you the latest development release of Iroha 2.

## 2. Configuring Iroha 2

<!-- Check: a reference about future releases or work in progress -->

At present, the Kotlin SDK doesn't have any classes to interact with the
configuration. Instead, you are provided with a ready-made `Iroha2Client`
that reads the configuration from the environment variables and/or the
resident `config.json` in the working directory.

If you are so inclined, you can have a look at the `testcontainers` module,
and see how the `Iroha2Config` is implemented.

<<<@/snippets/IrohaConfig.kotlin

## 3. Querying and Registering Domains

Querying and Registering a domain are easier operations. The usual boilerplate
code, that often only serves to instantiate a client from an on-disk
configuration file, is unnecessary. We will immediately add all the necessary 
imports to implement this client:

```kotlin
import jp.co.soramitsu.iroha2.*
import jp.co.soramitsu.iroha2.generated.crypto.PublicKey
import jp.co.soramitsu.iroha2.generated.datamodel.Value
import jp.co.soramitsu.iroha2.generated.datamodel.account.AccountId
import jp.co.soramitsu.iroha2.generated.datamodel.asset.AssetValue
import jp.co.soramitsu.iroha2.generated.datamodel.asset.AssetValueType
import jp.co.soramitsu.iroha2.generated.datamodel.asset.Mintable
import jp.co.soramitsu.iroha2.generated.datamodel.metadata.Metadata
import jp.co.soramitsu.iroha2.generated.datamodel.name.Name
import jp.co.soramitsu.iroha2.generated.datamodel.predicate.GenericValuePredicateBox
import jp.co.soramitsu.iroha2.generated.datamodel.predicate.value.ValuePredicate
import jp.co.soramitsu.iroha2.query.QueryBuilder
import kotlinx.coroutines.runBlocking
import kotlinx.coroutines.withTimeout
import java.net.URL
import java.security.KeyPair
```

We shall write this example in the form of a test class, hence the presence
of test-related packages. Note the presence of `coroutines.runBlocking`.
Iroha makes extensive use of asynchronous programming (in Rust
terminology), hence blocking is not necessarily the only mode of
interaction with the Iroha 2 code.

In order to make sure that the raised peers work correctly, you can do a simple 
operation to get all registered domains.

Next, we will add wrappers to the classes created in this section.

```kotlin
fun main(args: Array<String>): Unit = runBlocking{
    val peerUrl = "http://127.0.0.1:8080"
    val telemetryUrl = "http://127.0.0.1:8180"
    val admin = AccountId("bob".asName(), "wonderland".asDomainId())
    val adminKeyPair = keyPairFromHex("7233bfc89dcbd68c19fde6ce6158225298ec1131b6a130d1aeb454c1ab5183c0",
        "9ac47abf59b356e0bd7dcbbbb4dec080e302156a48ca907e47cb6aea1d32719e")

    val client = AdminIroha2Client(URL(peerUrl), URL(telemetryUrl), log = true)
    val query = Query(client, admin, adminKeyPair)

    query.findAllDomains()
        .also { println("ALL DOMAINS: ${it.map { d -> d.id.asString() }}") }

}

open class Query (private val client: AdminIroha2Client,
                  private val admin: AccountId,
                  private val keyPair: KeyPair) {
    
    suspend fun findAllDomains(queryFilter: GenericValuePredicateBox<ValuePredicate>? = null) = QueryBuilder
        .findAllDomains(queryFilter)
        .account(admin)
        .buildSigned(keyPair)
        .let { client.sendQuery(it) }
}
```

The output in the terminal will contain a list of all domains that are currently registered.

::: details Expand to see the expected output

```
ALL DOMAINS: [wonderland, genesis, garden_of_live_flowers]
```

:::

To register a new domain, add the following lines to Main.kt:

```kotlin
val sendTransaction = SendTransaction(client, admin, adminKeyPair)

val domain = "looking_glass_${System.currentTimeMillis()}"
    sendTransaction.registerDomain(domain).also { println("DOMAIN $domain CREATED") }
```

Then create new open class `SendTransaction` in your project:

```kotlin
open class SendTransaction (private val client: AdminIroha2Client,
                            private val admin: AccountId,
                            private val keyPair: KeyPair,
                            private val timeout: Long = 10000) {

    suspend fun registerDomain(
        id: String,
        metadata: Map<Name, Value> = mapOf(),
        admin: AccountId = this.admin,
        keyPair: KeyPair = this.keyPair
    ) {
        client.sendTransaction {
            account(admin)
            this.registerDomain(id.asDomainId(), metadata)
            buildSigned(keyPair)
        }.also {
            withTimeout(timeout) { it.await() }
        }
    }
}
```

::: details Expand to see the expected output

```
DOMAIN looking_glass CREATED
ALL DOMAINS: [looking_glass, garden_of_live_flowers, genesis, wonderland]
```

:::

## 4. Registering an Account

Registering an account is more involved than the aforementioned functions.
Previously, we only had to worry about submitting a single instruction,
with a single string-based registration box (in Rust terminology, the
heap-allocated reference types are all called boxes).

When registering an account, there are a few more variables. The account
can only be registered to an existing domain. Also, an account typically
has to have a key pair. 

To register a new account, add the following lines to `Main.kt`:

```Kotlin
    val madHatter = "madHatter_${System.currentTimeMillis()}$ACCOUNT_ID_DELIMITER$domain"
    val madHatterKeyPair = generateKeyPair()
    sendTransaction.registerAccount(madHatter, listOf(madHatterKeyPair.public.toIrohaPublicKey()))
        .also { println("ACCOUNT $madHatter CREATED") }

    query.findAllAccounts()
        .also { println("ALL ACCOUNTS: ${it.map { a -> a.id.asString() }}") }
```

Then implement new method for class `SendTransaction` in your project.

```Kotlin
    suspend fun registerAccount(
        id: String,
        signatories: List<PublicKey>,
        metadata: Map<Name, Value> = mapOf(),
        admin: AccountId = this.admin,
        keyPair: KeyPair = this.keyPair
    ) {
        client.sendTransaction {
            account(admin)
            this.registerAccount(id.asAccountId(), signatories, Metadata(metadata))
            buildSigned(keyPair)
        }.also {
            withTimeout(timeout) { it.await() }
        }
    }
```

Also, a new method has been added to the `Query` class.

```Kotlin
    suspend fun findAllAccounts(queryFilter: GenericValuePredicateBox<ValuePredicate>? = null) = QueryBuilder
        .findAllAccounts(queryFilter)
        .account(admin)
        .buildSigned(keyPair)
        .let {
            client.sendQuery(it)
    }
```

::: details Expand to see the expected output

```
DOMAIN looking_glass_1684835731653 CREATED
ALL DOMAINS: [looking_glass, garden_of_live_flowers, genesis, wonderland, looking_glass_1684835731653]
ACCOUNT madHatter_1684835733686@looking_glass_1684835731653 CREATED
ALL ACCOUNTS: [carpenter@garden_of_live_flowers, genesis@genesis, alice@wonderland, bob@wonderland, madHatter_1684835733686@looking_glass_1684835731653]
```

:::

As you can see, for _illustrative purposes_, we have generated a new
key-pair. We converted that key-pair into an Iroha-compatible format using
`toIrohaPublicKey`, and added the public key to the instruction to register
an account.

## 5. Registering and minting assets

Iroha has been built with few
[underlying assumptions](/blockchain/assets.md) about what the assets need
to be in terms of their value type and characteristics (fungible or
non-fungible, mintable or non-mintable).

::: info

<!-- Check: a reference about future releases or work in progress -->

The non-mintable assets are a relatively recent addition to Iroha 2, thus
registering and minting such assets is not presently possible through the
Kotlin SDK.

:::

To register new assets definition, add the following lines of code to `main`

```Kotlin
    val assetDefinition = "asset_time_${System.currentTimeMillis()}$ASSET_ID_DELIMITER$domain"
    sendTransaction.registerAssetDefinition(assetDefinition, AssetValueType.Quantity())
        .also { println("ASSET DEFINITION $assetDefinition CREATED") }
```

Then implement new method for class `SendTransaction` in your project.

```Kotlin
    suspend fun registerAssetDefinition(
        id: String,
        type: AssetValueType = AssetValueType.Store(),
        metadata: Map<Name, Value> = mapOf(),
        mintable: Mintable = Mintable.Infinitely(),
        admin: AccountId = this.admin,
        keyPair: KeyPair = this.keyPair
    ) {
        client.sendTransaction {
            account(admin)
            this.registerAssetDefinition(id.asAssetDefinitionId(), type, Metadata(metadata), mintable)
            buildSigned(keyPair)
        }.also {
            withTimeout(timeout) { it.await() }
        }
    }
```

To mint new assets, add the following lines of code to `main`

```Kotlin
    val madHatterAsset = "$assetDefinition$ASSET_ID_DELIMITER$madHatter"
    sendTransaction.registerAsset(madHatterAsset, AssetValue.Quantity(100))
        .also { println("ASSET $madHatterAsset CREATED") }
```

Then implement new method for class `SendTransaction` in your project.

```Kotlin
    suspend fun registerAsset(
        id: String,
        value: AssetValue,
        admin: AccountId = this.admin,
        keyPair: KeyPair = this.keyPair
        ) {
        client.sendTransaction {
            account(admin)
            this.registerAsset(id.asAssetId(), value)
            buildSigned(keyPair)
        }.also {
            withTimeout(timeout) { it.await() }
            }
        }
```

To check the result, add the following line of code to the class `main`

```Kotlin
    query.findAllAssets()
        .also { println("ALL ASSETS: ${it.map { a -> a.id.asString() }}") }
```

Also, a new method has been added to the `open class Query`

```Kotlin
    suspend fun findAllAssets(queryFilter: GenericValuePredicateBox<ValuePredicate>? = null) = QueryBuilder
        .findAllAssets(queryFilter)
        .account(admin)
        .buildSigned(keyPair)
        .let { client.sendQuery(it) }
```

::: details Expand to see the expected output

```
DOMAIN looking_glass_1684842996549 CREATED
ALL DOMAINS: [looking_glass, garden_of_live_flowers, genesis, looking_glass_1684842996549, wonderland, looking_glass_1684835731653]
ACCOUNT madHatter_1684842997930@looking_glass_1684842996549 CREATED
ALL ACCOUNTS: [carpenter@garden_of_live_flowers, genesis@genesis, madHatter_1684842997930@looking_glass_1684842996549, alice@wonderland, bob@wonderland, madHatter_1684835733686@looking_glass_1684835731653]
ASSET DEFINITION asset_time_1684842998891#looking_glass_1684842996549 CREATED
ASSET asset_time_1684842998891#looking_glass_1684842996549#madHatter_1684842997930@looking_glass_1684842996549 CREATED
ALL ASSETS: [asset_time_1684842998891#looking_glass_1684842996549#madHatter_1684842997930@looking_glass_1684842996549, cabbage#garden_of_live_flowers#alice@wonderland, rose#wonderland#alice@wonderland]```
```

:::

## 6. Transferring assets

After we have registered and minted madHatter's assets, let's transfer
some of them to another blockchain user. To do this, we will create a new
user, register their asset with the `main` method and add transfer operations for the asset.

```Kotlin
    val whiteRabbit = "whiteRabbit_${System.currentTimeMillis()}$ACCOUNT_ID_DELIMITER$domain"
    val whiteRabbitKeyPair = generateKeyPair()
    sendTransaction.registerAccount(whiteRabbit, listOf(whiteRabbitKeyPair.public.toIrohaPublicKey()))
        .also { println("ACCOUNT $whiteRabbit CREATED") }
    
    val whiteRabbitAsset = "$assetDefinition$ASSET_ID_DELIMITER$whiteRabbit"
    sendTransaction.registerAsset(whiteRabbitAsset, AssetValue.Quantity(0))
        .also { println("ASSET $whiteRabbitAsset CREATED") }
    
    sendTransaction.transferAsset(madHatterAsset, 10, whiteRabbitAsset, madHatter.asAccountId(), madHatterKeyPair)
        .also { println("$madHatter TRANSFERRED FROM $madHatterAsset TO $whiteRabbitAsset: 10") }
    query.getAccountAmount(madHatter, madHatterAsset).also { println("$madHatterAsset BALANCE: $it") }
    query.getAccountAmount(whiteRabbit, whiteRabbitAsset).also { println("$whiteRabbitAsset BALANCE: $it") }
```

In the `sendTransaction` class, add a method for transferring assets.

```Kotlin
    suspend fun transferAsset(
        from: String,
        value: Int,
        to: String,
        admin: AccountId = this.admin,
        keyPair: KeyPair = this.keyPair
    ) {
        client.sendTransaction {
            account(admin)
            this.transferAsset(from.asAssetId(), value, to.asAssetId())
            buildSigned(keyPair)
        }.also {
            withTimeout(timeout) { it.await() }
        }
    }
```

To check the result of the asset transfer, add the `getAccountAmount()` method to the `Query` class:

```Kotlin
    suspend fun getAccountAmount(accountId: String, assetId: String): Long {
        return QueryBuilder.findAccountById(accountId.asAccountId())
            .account(admin)
            .buildSigned(keyPair)
            .let { query ->
                client.sendQuery(query).assets[assetId.asAssetId()]?.value
            }.let { value ->
                value?.cast<AssetValue.Quantity>()?.u32
            } ?: throw RuntimeException("NOT FOUND")
    }
```

The console output should contain similar information.

::: details Expand to see the expected output

```
DOMAIN looking_glass_1684843200289 CREATED
ALL DOMAINS: [looking_glass, garden_of_live_flowers, genesis, looking_glass_1684843200289, looking_glass_1684842996549, wonderland, looking_glass_1684835731653]
ACCOUNT madHatter_1684843202389@looking_glass_1684843200289 CREATED
ALL ACCOUNTS: [carpenter@garden_of_live_flowers, genesis@genesis, madHatter_1684843202389@looking_glass_1684843200289, madHatter_1684842997930@looking_glass_1684842996549, alice@wonderland, bob@wonderland, madHatter_1684835733686@looking_glass_1684835731653]
ASSET DEFINITION asset_time_1684843203337#looking_glass_1684843200289 CREATED
ASSET asset_time_1684843203337#looking_glass_1684843200289#madHatter_1684843202389@looking_glass_1684843200289 CREATED
ACCOUNT whiteRabbit_1684843205383@looking_glass_1684843200289 CREATED
ASSET asset_time_1684843203337#looking_glass_1684843200289#whiteRabbit_1684843205383@looking_glass_1684843200289 CREATED
madHatter_1684843202389@looking_glass_1684843200289 TRANSFERRED FROM asset_time_1684843203337#looking_glass_1684843200289#madHatter_1684843202389@looking_glass_1684843200289 TO asset_time_1684843203337#looking_glass_1684843200289#whiteRabbit_1684843205383@looking_glass_1684843200289: 10
asset_time_1684843203337#looking_glass_1684843200289#madHatter_1684843202389@looking_glass_1684843200289 BALANCE: 90
asset_time_1684843203337#looking_glass_1684843200289#whiteRabbit_1684843205383@looking_glass_1684843200289 BALANCE: 10
ALL ASSETS: [asset_time_1684843203337#looking_glass_1684843200289#madHatter_1684843202389@looking_glass_1684843200289, cabbage#garden_of_live_flowers#alice@wonderland, rose#wonderland#alice@wonderland]
```

:::

## 7. Burning assets

Burning assets is quite similar to minting them. To get started, let's add the following lines 
to the `main()` method:

```Kotlin
    sendTransaction.burnAssets(madHatterAsset, 10, madHatter.asAccountId(), madHatterKeyPair)
        .also { println("${madHatterAsset} WAS BURN") }

    query.getAccountAmount(madHatter, madHatterAsset)
        .also { println("$madHatterAsset BALANCE: $it AFTER ASSETS BURNING") }
```

Then implement a wrapper over the `burnAssets()` method in the `sendTransaction` class:

```Kotlin
    suspend fun burnAssets(
        assetId: String,
        value: Int,
        admin: AccountId = this.admin,
        keyPair: KeyPair = this.keyPair
    ) {
        client.sendTransaction {
            account(admin)
            this.burnAsset(assetId.asAssetId(), value)
            buildSigned(keyPair)
        }.also {
            withTimeout(timeout) { it.await() }
        }
    }
```

::: details Expand to see the expected output

```
DOMAIN looking_glass_1684843511587 CREATED
ALL DOMAINS: [looking_glass, garden_of_live_flowers, looking_glass_1684843344208, genesis, looking_glass_1684843200289, looking_glass_1684842996549, wonderland, looking_glass_1684843511587, looking_glass_1684843451130, looking_glass_1684835731653]
ACCOUNT madHatter_1684843513272@looking_glass_1684843511587 CREATED
ALL ACCOUNTS: [carpenter@garden_of_live_flowers, madHatter_1684843345604@looking_glass_1684843344208, whiteRabbit_1684843348692@looking_glass_1684843344208, genesis@genesis, madHatter_1684835733686@looking_glass_1684835731653]
ASSET DEFINITION asset_time_1684843514251#looking_glass_1684843511587 CREATED
ASSET asset_time_1684843514251#looking_glass_1684843511587#madHatter_1684843513272@looking_glass_1684843511587 CREATED
ACCOUNT whiteRabbit_1684843516303@looking_glass_1684843511587 CREATED
ASSET asset_time_1684843514251#looking_glass_1684843511587#whiteRabbit_1684843516303@looking_glass_1684843511587 CREATED
madHatter_1684843513272@looking_glass_1684843511587 TRANSFERRED FROM asset_time_1684843514251#looking_glass_1684843511587#madHatter_1684843513272@looking_glass_1684843511587 TO asset_time_1684843514251#looking_glass_1684843511587#whiteRabbit_1684843516303@looking_glass_1684843511587: 10
asset_time_1684843514251#looking_glass_1684843511587#madHatter_1684843513272@looking_glass_1684843511587 BALANCE: 90
asset_time_1684843514251#looking_glass_1684843511587#whiteRabbit_1684843516303@looking_glass_1684843511587 BALANCE: 10
asset_time_1684843514251#looking_glass_1684843511587#madHatter_1684843513272@looking_glass_1684843511587 WAS BURN
asset_time_1684843514251#looking_glass_1684843511587#madHatter_1684843513272@looking_glass_1684843511587 BALANCE: 80 AFTER ASSETS BURNING
ALL ASSETS: [asset_time_1684843514251#looking_glass_1684843511587#whiteRabbit_1684843516303@looking_glass_1684843511587, asset_time_1684843454049#looking_glass_1684843451130#madHatter_1684843453085@looking_glass_1684843451130, asset_time_1684843454049#looking_glass_1684843451130#whiteRabbit_1684843456091@looking_glass_1684843451130]
```

:::

## 8. Visualizing outputs

Finally, we should talk about visualising data. The Rust API is currently
the most complete in terms of available queries and instructions. After
all, this is the language in which Iroha 2 was built. Kotlin, by contrast,
supports only some features.

There are two possible event filters: `PipelineEventFilter` and
`DataEventFilter`, we shall focus on the former. This filter sieves events
pertaining to the process of submitting a transaction, executing a
transaction and committing it to a block.

```kotlin
import jp.co.soramitsu.iroha2.generated.datamodel.events.EventFilter.Pipeline
import jp.co.soramitsu.iroha2.generated.datamodel.events.pipeline.EventFilter
import jp.co.soramitsu.iroha2.generated.datamodel.events.pipeline.EntityType.Transaction
import jp.co.soramitsu.iroha2.generated.crypto.hash.Hash

val hash: ByteArray
val eventFilter = Pipeline(EventFilter(Transaction(), Hash(hash)))
```

What this short code snippet does is the following: It creates an event
pipeline filter that checks if a transaction with the specified hash was
submitted/rejected. This can then be used to see if the transaction we
submitted was processed correctly and provide feedback to the end-user.

## 9. Samples in pure Java

<<<@/snippets/JavaTest.java
