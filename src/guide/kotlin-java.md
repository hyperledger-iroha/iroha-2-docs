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
The Iroha 2 JVM-compatible SDKs are as much a work-in-progress as the rest
of this guide, and significantly more so than the Rust library.

Without further ado, here's a part of an example `build.gradle.kts` file,
specifically, the `repositories` and `dependencies` sections:

```kotlin
repositories {
    // Use Maven Central for resolving dependencies
    mavenCentral()
    // Use Jitpack
    maven { url = uri("https://jitpack.io") }
}

dependencies {
    // Align versions of all Kotlin components
    implementation(platform("org.jetbrains.kotlin:kotlin-bom"))
    // Use the Kotlin JDK 8 standard library
    implementation("org.jetbrains.kotlin:kotlin-stdlib-jdk8")
    // Load the dependency used by the application
    implementation("com.google.guava:guava:31.0.1-jre")
    // Use the Kotlin test library
    testImplementation("org.jetbrains.kotlin:kotlin-test")
    // Use the Kotlin JUnit integration
    testImplementation("org.jetbrains.kotlin:kotlin-test-junit")
    // Load Iroha-related dependencies
    implementation("com.github.hyperledger.iroha-java:client:SNAPSHOT")
    implementation("com.github.hyperledger.iroha-java:block:SNAPSHOT")
    implementation("com.github.hyperledger.iroha-java:model:SNAPSHOT")
    implementation("com.github.hyperledger.iroha-java:test-tools:SNAPSHOT")
}
```

You **should** replace the SNAPSHOT in the above configuration with the
latest `iroha-java` snapshot.

Snapshot versions match the Git commits. To get the latest snapshot, simply
visit the
[`iroha-java`](https://github.com/hyperledger/iroha-java/tree/iroha2-dev)
repository on the `iroha-2-dev` branch and copy the short hash of the last
commit on the main page.

![](/img/iroha_java_hash.png)

You can also check the
[commit history](https://github.com/hyperledger/iroha-java/commits/iroha2-dev)
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

```kotlin
package jp.co.soramitsu.iroha2.testcontainers

import jp.co.soramitsu.iroha2.Genesis
import jp.co.soramitsu.iroha2.generated.core.genesis.GenesisTransaction
import jp.co.soramitsu.iroha2.generated.core.genesis.RawGenesisBlock
import org.slf4j.LoggerFactory.getLogger
import org.testcontainers.containers.Network
import org.testcontainers.containers.Network.newNetwork
import org.testcontainers.containers.output.OutputFrame
import org.testcontainers.containers.output.Slf4jLogConsumer
import java.util.function.Consumer

class IrohaConfig(
    var networkToJoin: Network = newNetwork(),
    var logConsumer: Consumer<OutputFrame> = Slf4jLogConsumer(getLogger(IrohaContainer::class.java)),
    var genesis: Genesis = Genesis(RawGenesisBlock(listOf(GenesisTransaction(listOf())))),
    var shouldCloseNetwork: Boolean = true,
    var imageTag: String = IrohaContainer.DEFAULT_IMAGE_TAG
)
```

## 3. Registering a Domain

Registering a domain is one of the easier operations. The usual boilerplate
code, that often only serves to instantiate a client from an on-disk
configuration file, is unnecessary. Instead, you have to deal with a few
imports:

```kotlin
import org.junit.jupiter.api.extension.ExtendWith
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Assertions
import jp.co.soramitsu.iroha2.engine.IrohaRunnerExtension
import jp.co.soramitsu.iroha2.Iroha2Client
import jp.co.soramitsu.iroha2.engine.WithIroha
import kotlinx.coroutines.runBlocking
import kotlin.test.assertEquals
import java.util.concurrent.TimeUnit
import jp.co.soramitsu.iroha2.generated.datamodel.account.Id as AccountId
```

We shall write this example in the form of a test class, hence the presence
of test-related packages. Note the presence of `coroutines.runBlocking`.
Iroha makes extensive use of asynchronous programming (in Rust
terminology), hence blocking is not necessarily the only mode of
interaction with the Iroha 2 code.

We have started by creating a mutable lazy-initialised client. This client
is passed an instance of a domain registration box, which we get as a
result of evaluating `registerDomain(domainName)`. Then the client is sent
a transaction which consists of that one instruction. And that's it.

```kotlin
@ExtendWith(IrohaRunnerExtension::class)
class Test {

    lateinit var client: Iroha2Client

    @Test
    @WithIroha(genesis = DefaultGenesis.class)
    fun `register domain instruction committed`(): Unit = runBlocking {
        val domainName = "looking_glass"
        val aliceAccountId = AccountId("alice", "wonderland")
        client.sendTransaction {
            accountId = AccountId("alice", "wonderland")
            registerDomain(domainName)
            buildSigned(ALICE_KEYPAIR)
        }.also {
            Assertions.assertDoesNotThrow {
                it.get(10, TimeUnit.SECONDS)
            }
        }

        QueryBuilder.findDomainByName(domainName)
            .account(aliceAccountId)
            .buildSigned(ALICE_KEYPAIR)
            .let { query -> client.sendQuery(query) }
            .also { result -> assertEquals(result.name, domainName) }
    }
}
```

Well, almost. You may have noticed that we had to do this on behalf of
`aliceAccountId`. This is because any transaction on the Iroha 2 blockchain
has to be done by an account. This is a special account that must already
exist on the blockchain. You can ensure that point by reading through
`genesis.json` and seeing that **_alice_** indeed has an account, with a
public key. Furthermore, the account's public key must be included in the
configuration. If either of these two is missing, you will not be able to
register an account, and will be greeted by an exception of an appropriate
type.

## 4. Registering an Account

Registering an account is more involved than the aforementioned functions.
Previously, we only had to worry about submitting a single instruction,
with a single string-based registration box (in Rust terminology, the
heap-allocated reference types are all called boxes).

When registering an account, there are a few more variables. The account
can only be registered to an existing domain. Also, an account typically
has to have a key pair. So if e.g. _alice@wonderland_ was registering an
account for _white_rabbit@looking_glass_, she should provide his public
key.

It is tempting to generate both the private and public keys at this time,
but it isn't the brightest idea. Remember that _the white_rabbit_ trusts
_you, alice@wonderland,_ to create an account for them in the domain
_looking_glass_, **but doesn't want you to have access to that account
after creation**.

If you gave _white_rabbit_ a key that you generated yourself, how would
they know if you don't have a copy of their private key? Instead, the best
way is to **ask** _white_rabbit_ to generate a new key-pair, and give you
the public half of it.

Similarly to the previous example, we provide the instructions in the form
of a test:

```kotlin
import org.junit.jupiter.api.extension.ExtendWith
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Assertions
import jp.co.soramitsu.iroha2.engine.IrohaRunnerExtension
import jp.co.soramitsu.iroha2.Iroha2Client
import jp.co.soramitsu.iroha2.generateKeyPair
import jp.co.soramitsu.iroha2.engine.WithIroha
import kotlinx.coroutines.runBlocking
import kotlin.test.assertEquals
import java.util.concurrent.TimeUnit
import jp.co.soramitsu.iroha2.generated.datamodel.account.Id as AccountId

@ExtendWith(IrohaRunnerExtension::class)
class Test {

    lateinit var client: Iroha2Client

    @Test
    @WithIroha(genesis = DefaultGenesis.class)
    fun `register account instruction committed`(): Unit = runBlocking {
        val aliceAccountId = AccountId("alice", "wonderland")
        val newAccountId = AccountId("white_rabbit", "looking_glass")
        val keyPair = generateKeyPair()
        val signatories = listOf(keyPair.public.toIrohaPublicKey())

        client.sendTransaction {
            accountId = aliceAccountId
            registerAccount(newAccountId, signatories)
            buildSigned(ALICE_KEYPAIR)
        }.also {
            Assertions.assertDoesNotThrow {
                it.get(10, TimeUnit.SECONDS)
            }
        }

        QueryBuilder.findAccountById(newAccountId)
            .account(aliceAccountId)
            .buildSigned(ALICE_KEYPAIR)
            .let { query -> client.sendQuery(query) }
            .also { account -> assertEquals(account.id, newAccountId) }
    }
}
```

As you can see, for _illustrative purposes_, we have generated a new
key-pair. We converted that key-pair into an Iroha-compatible format using
`toIrohaPublicKey`, and added the public key to the instruction to register
an account.

Again, it's important to note that we are using _alice@wonderland_ as a
proxy to interact with the blockchain, hence her credentials also appear in
the transaction.

## 5. Registering and minting assets

Iroha has been built with few
[underlying assumptions](./blockchain/assets.md) about what the assets need
to be in terms of their value type and characteristics (fungible or
non-fungible, mintable or non-mintable).

::: info

<!-- Check: a reference about future releases or work in progress -->

The non-mintable assets are a relatively recent addition to Iroha 2, thus
registering and minting such assets is not presently possible through the
Kotlin SDK.

:::

```kotlin
import org.junit.jupiter.api.extension.ExtendWith
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Assertions
import jp.co.soramitsu.iroha2.engine.IrohaRunnerExtension
import jp.co.soramitsu.iroha2.Iroha2Client
import jp.co.soramitsu.iroha2.engine.WithIroha
import kotlinx.coroutines.runBlocking
import kotlin.test.assertEquals
import java.util.concurrent.TimeUnit
import jp.co.soramitsu.iroha2.generated.datamodel.asset.AssetValue
import jp.co.soramitsu.iroha2.generated.datamodel.asset.AssetValueType
import jp.co.soramitsu.iroha2.generated.datamodel.account.Id as AccountId
import jp.co.soramitsu.iroha2.generated.datamodel.asset.Id as AssetId
import jp.co.soramitsu.iroha2.generated.datamodel.asset.DefinitionId

@ExtendWith(IrohaRunnerExtension::class)
class Test {

    lateinit var client: Iroha2Client

    @Test
    @WithIroha(genesis = DefaultGenesis.class)
    fun `mint asset instruction committed`(): Unit = runBlocking {
        val aliceAccountId = AccountId("alice", "wonderland")
        val definitionId = DefinitionId("time", "looking_glass")
        val assetId = AssetId(definitionId, aliceAccountId)
				val newAccountId = AccountId("white_rabbit", "looking_glass")
        val keyPair = generateKeyPair()
        val signatories = listOf(keyPair.public.toIrohaPublicKey())

        client.sendTransaction {
            account(aliceAccountId)
            registerAsset(definitionId, AssetValueType.Fixed())
            buildSigned(ALICE_KEYPAIR)
        }.also {
            Assertions.assertDoesNotThrow {
                it.get(10, TimeUnit.SECONDS)
            }
        }

        client.sendTransaction {
            account(aliceAccountId)
            mintAsset(assetId, 5)
            buildSigned(ALICE_KEYPAIR)
        }.also {
            Assertions.assertDoesNotThrow {
                it.get(10, TimeUnit.SECONDS)
            }
        }

        QueryBuilder.findAccountById(aliceAccountId)
            .account(aliceAccountId)
            .buildSigned(ALICE_KEYPAIR)
            .let { query -> client.sendQuery(query) }
            .also { result ->
                assertEquals(5, (result.assets[assetId]?.value as? AssetValue.Quantity)?.u32)
            }
    }
```

Note that our original intention was to register an asset named
_time#looking_glass_ that was non-mintable. Due to a technical limitation
we cannot prevent that asset from being minted. However, we can ensure that
the late bunny is always late: _alice@wonderland_ can mint time but only to
her account initially.

If she tried to mint an asset that was registered using a different client,
which was non-mintable, this attempt would have been rejected, _and Alice
alongside her long-eared, perpetually stressed friend would have no way of
making more time_.

## 6. Visualizing outputs

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

## 7. Samples in pure Java

```java
package jp.co.soramitsu.iroha2;

import jp.co.soramitsu.iroha2.client.Iroha2AsyncClient;
import jp.co.soramitsu.iroha2.generated.datamodel.Value;
import jp.co.soramitsu.iroha2.generated.datamodel.account.Account;
import jp.co.soramitsu.iroha2.generated.datamodel.account.AccountId;
import jp.co.soramitsu.iroha2.generated.datamodel.asset.AssetId;
import jp.co.soramitsu.iroha2.generated.datamodel.asset.AssetValue;
import jp.co.soramitsu.iroha2.generated.datamodel.asset.AssetValueType;
import jp.co.soramitsu.iroha2.generated.datamodel.domain.Domain;
import jp.co.soramitsu.iroha2.generated.datamodel.domain.DomainId;
import jp.co.soramitsu.iroha2.generated.datamodel.metadata.Metadata;
import jp.co.soramitsu.iroha2.generated.datamodel.name.Name;
import jp.co.soramitsu.iroha2.generated.datamodel.transaction.VersionedSignedTransaction;
import jp.co.soramitsu.iroha2.query.QueryAndExtractor;
import jp.co.soramitsu.iroha2.query.QueryBuilder;
import jp.co.soramitsu.iroha2.testengine.DefaultGenesis;
import jp.co.soramitsu.iroha2.testengine.IrohaTest;
import jp.co.soramitsu.iroha2.testengine.WithIroha;
import jp.co.soramitsu.iroha2.transaction.TransactionBuilder;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

import static jp.co.soramitsu.iroha2.testengine.TestConstsKt.*;

public class JavaTest extends IrohaTest<Iroha2AsyncClient> {

    @Test
    @WithIroha(genesis = DefaultGenesis.class)
    public void instructionFailed() {
        final VersionedSignedTransaction transaction = TransactionBuilder.Companion
            .builder()
            .account(ALICE_ACCOUNT_ID)
            .fail("FAIL MESSAGE")
            .buildSigned(ALICE_KEYPAIR);
        final CompletableFuture<byte[]> future = client.sendTransactionAsync(transaction);
        Assertions.assertThrows(ExecutionException.class,
            () -> future.get(getTxTimeout().getSeconds(), TimeUnit.SECONDS)
        );
    }

    @Test
    @WithIroha(genesis = DefaultGenesis.class)
    public void registerDomainInstructionCommitted() throws ExecutionException, InterruptedException, TimeoutException {
        final DomainId domainId = new DomainId(new Name("new_domain_name"));
        final VersionedSignedTransaction transaction = TransactionBuilder.Companion
            .builder()
            .account(ALICE_ACCOUNT_ID)
            .registerDomain(domainId)
            .buildSigned(ALICE_KEYPAIR);
        client.sendTransactionAsync(transaction).get(getTxTimeout().getSeconds(), TimeUnit.SECONDS);

        final QueryAndExtractor<Domain> query = QueryBuilder
            .findDomainById(domainId)
            .account(ALICE_ACCOUNT_ID)
            .buildSigned(ALICE_KEYPAIR);
        final CompletableFuture<Domain> future = client.sendQueryAsync(query);
        final Domain domain = future.get(getTxTimeout().getSeconds(), TimeUnit.SECONDS);
        Assertions.assertEquals(domain.getId(), domainId);
    }

    @Test
    @WithIroha(genesis = DefaultGenesis.class)
    public void registerAccountInstructionCommitted() throws Exception {
        final AccountId accountId = new AccountId(
            new Name("new_account"),
            DEFAULT_DOMAIN_ID
        );
        final VersionedSignedTransaction transaction = TransactionBuilder.Companion
            .builder()
            .account(ALICE_ACCOUNT_ID)
            .registerAccount(accountId, new ArrayList<>())
            .buildSigned(ALICE_KEYPAIR);
        client.sendTransactionAsync(transaction).get(getTxTimeout().getSeconds(), TimeUnit.SECONDS);

        final QueryAndExtractor<Account> query = QueryBuilder
            .findAccountById(accountId)
            .account(ALICE_ACCOUNT_ID)
            .buildSigned(ALICE_KEYPAIR);
        final CompletableFuture<Account> future = client.sendQueryAsync(query);
        final Account account = future.get(getTxTimeout().getSeconds(), TimeUnit.SECONDS);
        Assertions.assertEquals(account.getId(), accountId);
    }

    @Test
    @WithIroha(genesis = DefaultGenesis.class)
    public void mintAssetInstructionCommitted() throws Exception {
        final VersionedSignedTransaction registerAssetTx = TransactionBuilder.Companion
            .builder()
            .account(ALICE_ACCOUNT_ID)
            .registerAssetDefinition(DEFAULT_ASSET_DEFINITION_ID, new AssetValueType.Quantity())
            .buildSigned(ALICE_KEYPAIR);
        client.sendTransactionAsync(registerAssetTx).get(getTxTimeout().getSeconds(), TimeUnit.SECONDS);

        final VersionedSignedTransaction mintAssetTx = TransactionBuilder.Companion
            .builder()
            .account(ALICE_ACCOUNT_ID)
            .mintAsset(DEFAULT_ASSET_ID, 5L)
            .buildSigned(ALICE_KEYPAIR);
        client.sendTransactionAsync(mintAssetTx).get(getTxTimeout().getSeconds(), TimeUnit.SECONDS);

        final QueryAndExtractor<Account> query = QueryBuilder
            .findAccountById(ALICE_ACCOUNT_ID)
            .account(ALICE_ACCOUNT_ID)
            .buildSigned(ALICE_KEYPAIR);
        final CompletableFuture<Account> future = client.sendQueryAsync(query);
        final Account account = future.get(getTxTimeout().getSeconds(), TimeUnit.SECONDS);
        final AssetValue value = account.getAssets().get(DEFAULT_ASSET_ID).getValue();
        Assertions.assertEquals(5, ((AssetValue.Quantity) value).getU32());
    }

    @Test
    @WithIroha(genesis = DefaultGenesis.class)
    public void updateKeyValueInstructionCommitted() throws Exception {
        final Name assetMetadataKey = new Name("asset_metadata_key");
        final Value.String assetMetadataValue = new Value.String("some string value");
        final Value.String assetMetadataValue2 = new Value.String("some string value 2");
        final Metadata metadata = new Metadata(new HashMap<Name, Value>() {{
            put(assetMetadataKey, assetMetadataValue);
        }});

        final VersionedSignedTransaction registerAssetTx = TransactionBuilder.Companion
            .builder()
            .account(ALICE_ACCOUNT_ID)
            .registerAssetDefinition(DEFAULT_ASSET_DEFINITION_ID, new AssetValueType.Store(), metadata)
            .buildSigned(ALICE_KEYPAIR);
        client.sendTransactionAsync(registerAssetTx).get(getTxTimeout().getSeconds(), TimeUnit.SECONDS);

        final AssetId assetId = new AssetId(DEFAULT_ASSET_DEFINITION_ID, ALICE_ACCOUNT_ID);
        final VersionedSignedTransaction keyValueTx = TransactionBuilder.Companion
            .builder()
            .account(ALICE_ACCOUNT_ID)
            .setKeyValue(
                assetId,
                assetMetadataKey,
                assetMetadataValue2
            ).buildSigned(ALICE_KEYPAIR);
        client.sendTransactionAsync(keyValueTx).get(10, TimeUnit.SECONDS);

        final QueryAndExtractor<Value> assetDefinitionValueQuery = QueryBuilder
            .findAssetKeyValueByIdAndKey(assetId, assetMetadataKey)
            .account(ALICE_ACCOUNT_ID)
            .buildSigned(ALICE_KEYPAIR);
        final CompletableFuture<Value> future = client.sendQueryAsync(assetDefinitionValueQuery);

        final Value value = future.get(10, TimeUnit.SECONDS);
        Assertions.assertEquals(
            ((Value.String) value).getString(),
            assetMetadataValue2.getString()
        );
    }

    @Test
    @WithIroha(genesis = DefaultGenesis.class)
    public void setKeyValueInstructionCommitted() throws Exception {
        final Value.String assetValue = new Value.String("some string value");
        final Name assetKey = new Name("asset_metadata_key");

        final VersionedSignedTransaction registerAssetTx = TransactionBuilder.Companion
            .builder()
            .account(ALICE_ACCOUNT_ID)
            .registerAssetDefinition(DEFAULT_ASSET_DEFINITION_ID, new AssetValueType.Store())
            .buildSigned(ALICE_KEYPAIR);
        client.sendTransactionAsync(registerAssetTx).get(getTxTimeout().getSeconds(), TimeUnit.SECONDS);

        final VersionedSignedTransaction keyValueTx = TransactionBuilder.Companion
            .builder()
            .account(ALICE_ACCOUNT_ID)
            .setKeyValue(
                DEFAULT_ASSET_DEFINITION_ID,
                assetKey,
                assetValue
            ).buildSigned(ALICE_KEYPAIR);
        client.sendTransactionAsync(keyValueTx).get(10, TimeUnit.SECONDS);

        final QueryAndExtractor<Value> assetDefinitionValueQuery = QueryBuilder
            .findAssetDefinitionKeyValueByIdAndKey(DEFAULT_ASSET_DEFINITION_ID, assetKey)
            .account(ALICE_ACCOUNT_ID)
            .buildSigned(ALICE_KEYPAIR);
        final CompletableFuture<Value> future = client.sendQueryAsync(assetDefinitionValueQuery);

        final Value value = future.get(10, TimeUnit.SECONDS);
        Assertions.assertEquals(
            ((Value.String) value).getString(),
            assetValue.getString()
        );
    }
}
```
