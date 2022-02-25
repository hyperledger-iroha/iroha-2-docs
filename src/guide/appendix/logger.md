# Logger

This is possibly the easiest to understand. `"MAX_LOG_LEVEL": "WARN"`, changes the logging level to `WARN`. This means that you don’t get any messages, unless they’re either a warning or an error message. The available options are `TRACE` (every time you enter a function), `DEBUG` information that we use when we know something went wrong, `INFO` the default, `WARN` and `ERROR`, which silences any logging except for error messages.
Another useful option might be to use `"LOG_FILE_PATH": bunyan.json` . What this will do, is create (if it didn’t exist already) a file called `bunyan.json` that contains the logging in a structured format. This is extremely useful for two reasons: first, you can use the `bunyan` log viewer to filter information more precisely than Iroha would allow you to do. _Want only messages from a specific module or package? You can do that with bunyan_. Secondly, while copying logs is not too big of a problem if your instance is just a small setup, for bigger and longer running the process the larger the log will be. Having it be saved to a file makes much more sense in that case. (**TIP**: you can also set this to `/dev/stdout` if you want to use bunyan’s logging facilities directly, but don’t want to waste space in the filesystem).