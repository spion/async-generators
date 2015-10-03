# Async Generators

Proof that async generators dont need async/await

# example

```es6
var async   = require('./engine')
var Promise = require('bluebird');

var tenNumbers = async(function* tenNumbers() {
    for (var k = 0; k < 10; ++k) {
        yield async.await(Promise.delay(100));
        console.log(k);
        yield async.yield(k);
    }
})

async.iterate(tenNumbers(), val => console.log("Iterating", val));
```

# license

public domain / MIT