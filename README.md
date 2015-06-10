hals
====

[![Build Status](https://travis-ci.org/maxkueng/hals.svg)](https://travis-ci.org/maxkueng/hals)

**hals** (is German for throat) is a concurrency limiter that has a maximum
capacity for queued-up functions. When the capacity is reached newly added
tasks will be dropped. New tasks will be accepted once it has capacity again.

Unlike a queue, hals does not have a worker function that takes queued payloads
but instead takes functions and executes them.

The analogy goes as follows:

 - Only `concurrency` things can go down the throat at the same time.
 - But the mouth and throat can only hold `capacity` things. Everything else
   drops on the floor.

## Install

```sh
npm install hals --save
```

## Usage

```js
var hals = require('hals');

function drain () {
  console.log('drained');
}

var feed = hals({
  capacity: 3,    // optional; default: null (null = unlimited capacity)
  concurrency: 1, // optional; default: 1
  drain: drain    // optional; default null; function to be called when queue is empty
});

var foods = [  
  'broccoli',
  'tomato',
  'beans',
  'pork'
];

// add some tasks to hals
foods.forEach(function (food) {
  feed(function (next) {
    console.log('ate', food);
    next();
  });
});

// after a while add another task
setTimeout(function () {
	feed(function (next) {
	  console.log('ate zucchini');
	  next();
	});
}, 100);
```

prints:

```
ate broccoli
ate tomato
ate beans
drained

// didn't eat pork

ate zucchini
drained
```


## License

MIT
