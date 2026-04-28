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
    implementation("org.hyperledger.iroha:iroha-android-jvm:<version>")
}
```

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
AccountAddress address = AccountAddress.fromAccount("default", key, "ed25519");
System.out.println(address.canonicalHex());
System.out.println(address.toIH58(753));
```

## Current Coverage

The Android/JVM SDK currently focuses on:

- key management and secure-storage backends
- Norito encoding via the shared Java implementation
- Torii client scaffolding
- offline and subscription helpers
- account address and multisig utilities

## Upstream References

- `java/iroha_android/README.md`
- `java/iroha_android/build.gradle.kts`
- `java/iroha_android/samples-android`
