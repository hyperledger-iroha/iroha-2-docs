# Compatibility Matrix

The compatibility matrix shows cross-SDK scenario coverage for the current
Iroha 3 docs set. By default, the page loads the bundled snapshot for the
[`hyperledger-iroha/iroha` `i23-features` branch](https://github.com/hyperledger-iroha/iroha/tree/i23-features).

The matrix consists of:

- **Stories** in the first column
- **SDKs** across the remaining columns
- **Status symbols** for covered, failed, and missing data

<CompatibilityMatrixTable />

::: info
Set `VITE_COMPAT_MATRIX_URL` only to override the bundled snapshot with a
compatible live backend. Without that variable, the page loads
`src/public/compat-matrix.json`.
:::
