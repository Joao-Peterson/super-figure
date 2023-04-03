# New version

Add tag

```console
$ git tag -a v1.0.0 -m "message"
```

Change [package.json](package.json):

```json
...
	"version": "1.0.0",
...
```

Re-package

```console
$ vsce package
```