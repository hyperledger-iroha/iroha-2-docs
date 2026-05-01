# Android, Kotlin, and Java

The current JVM-facing mobile SDK in the workspace is `IrohaAndroid`. It
ships Android and JVM artifacts for Kotlin and Java applications.

## Gradle Setup

Point Gradle at the Maven repository that hosts the published artifacts and add
the dependencies you need:

```kotlin
repositories {
    google()
    mavenCentral()
    maven { url = uri("../../artifacts/android/maven") }
}

dependencies {
    implementation("org.hyperledger.iroha:iroha-android:<version>")
}
```

The checked-in Android and JVM publication scripts currently use the
`iroha-android` artifact ID. There is no separate `iroha-android-jvm` artifact
ID in the source build.

## Local Sample Build

```bash
./gradlew -p java/iroha_android :samples-android:assembleDebug \
  -PirohaAndroidUsePublished=true \
  -PirohaAndroidRepoDir=$PWD/../artifacts/android/maven
```

## Quickstart

```java
import org.hyperledger.iroha.android.address.AccountAddress;

byte[] key = new byte[32];
AccountAddress address = AccountAddress.fromAccount(key, "ed25519");
System.out.println(address.canonicalHex());
System.out.println(address.toI105(753));

AccountAddress.DisplayFormats formats = address.displayFormats();
System.out.println(formats.i105);
System.out.println(formats.i105Warning);
```

## Try Taira Read-Only

For a plain JVM smoke test, use Java's built-in HTTP client before adding SDK
transaction signing:

```java
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class TairaProbe {
  public static void main(String[] args) throws Exception {
    var client = HttpClient.newHttpClient();
    var request = HttpRequest.newBuilder()
        .uri(URI.create("https://taira.sora.org/status"))
        .GET()
        .build();

    var response = client.send(request, HttpResponse.BodyHandlers.ofString());
    System.out.println(response.statusCode());
    System.out.println(response.body());
  }
}
```

Save it as `TairaProbe.java`, then run it with JDK 11 or newer:

```bash
javac TairaProbe.java
java TairaProbe
```

Extend the same pattern to read `https://taira.sora.org/v1/domains?limit=5` or
`https://taira.sora.org/v1/assets/definitions?limit=5`. Use the Android SDK
for key handling and signed transactions after the read-only route is reachable.

## Current Coverage

The Android/JVM SDK currently focuses on:

- key management and secure-storage backends
- Norito encoding via the shared Java implementation
- Torii HTTP, streaming, and Norito RPC clients
- offline note, QR, and subscription helpers
- account address and multisig utilities
- generated instruction helpers for NFT and RWA flows

## Upstream References

- `java/iroha_android/README.md`
- `java/iroha_android/build.gradle.kts`
- `java/iroha_android/samples-android`
