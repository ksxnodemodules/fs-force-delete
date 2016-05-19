
# fs-force-delete

## Requirements

 * Node >= 6.0.0

## Usage

```javascript
var rm = require('fs-force-delete');
rm('foo', (error, info) => {
    if (error) {
        console.error('Failed', error);
    } else {
        console.log('Succeed', info);
    }
})
```

The code above would check for `'foo'` existence,
 * If `'foo'` doesn't exist, `rm` does nothing
 * If `'foo'` is a file, `rm` would deletes that file
 * If `'foo'` is a directory, `rm` would recurs itself with children of `'foo'` and then deletes `'foo'`

## License

[MIT](https://github.com/ksxnodemodules/my-licenses/blob/master/MIT.md) © [Hoàng Văn Khải](https://github.com/KSXGitHub)
