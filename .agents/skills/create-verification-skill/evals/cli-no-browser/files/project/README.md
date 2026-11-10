# Sample Tasks CLI

Build with `make build`. `./bin/tasks --data <path> add <text>` creates a task;
`./bin/tasks --data <path> list` prints tasks. Each invocation is local and
offline. Use a fresh temporary data path for checks.

The project has no web or desktop UI. Run unit tests with `make test`; those
tests do not prove the CLI command wiring or persisted output.
