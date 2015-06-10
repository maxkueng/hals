var expect = require('chai').expect;
var hals = require('../index');

describe('defaults', function () {

	it('should run all the tasks', function (done) {

		var counter = 0;

		function count (next) {
			counter += 1;
			next();
		}

		var h = hals({
			drain: function () {
				expect(counter).to.equal(4);
				done();
			}
		});

		h(count);
		h(count);
		h(count);
		h(count);
	});

});

describe('capacity', function () {

	it('should drop functions if capacity is reached', function (done) {

		var capacity = 2;

		var counter = 0;

		function count (next) {
			counter += 1;
			next();
		}

		var h = hals({
			capacity: capacity,
			drain: function () {
				expect(counter).to.equal(capacity);
				done();
			}
		});

		h(count);
		h(count);
		h(count);
		h(count);
	});

});


describe('concurrency', function () {

	it('should run functions in parallel', function (done) {

		var concurrency = 2;

		var counter = 0;
		var start = +new Date();
		var delays = {};

		var expectedDelays = {
			0: 100,
			1: 100,
			2: 200,
			3: 200,
			4: 300,
			5: 300
		};

		function count (next) {
			setTimeout(function () {
				var now = +new Date();
				var delay = Math.floor((now - start) / 100) * 100;
				delays[counter] = delay;

				counter += 1;
				next();
			}, 100);
		};

		var h = hals({
			concurrency: concurrency,
			drain: function () {
				expect(counter).to.equal(6);
				expect(delays).to.deep.equal(expectedDelays);
				done();
			}
		});

		h(count);
		h(count);
		h(count);
		h(count);
		h(count);
		h(count);
	});

});

describe('concurrency and capacity', function () {

	it('should run functions in parallel but drop when over capacity', function (done) {

		var capacity = 3;
		var concurrency = 2;

		var counter = 0;
		var start = +new Date();
		var delays = {};

		var expectedDelays = {
			0: 100,
			1: 100,
			2: 200
		};

		function count (next) {
			setTimeout(function () {
				var now = +new Date();
				var delay = Math.floor((now - start) / 100) * 100;
				delays[counter] = delay;

				counter += 1;
				next();
			}, 100);
		};

		var h = hals({
			capacity: capacity,
			concurrency: concurrency,
			drain: function () {
				expect(counter).to.equal(capacity);
				expect(delays).to.deep.equal(expectedDelays);
				done();
			}
		});

		h(count);
		h(count);
		h(count);
		h(count);
		h(count);
		h(count);
	});

});

describe('errors', function () {

	it('should throw if trying to add anything other than functions', function () {

		var counter = 0;

		function count (next) {
			counter += 1;
			next();
		}

		var h = hals({});

		function addInt () { h(1); }
		function addString () { h('lol'); }
		function addBoolean () { h(true); }
		function addUndefined () { h(undefined); }

		expect(addInt).to.throw();
		expect(addString).to.throw();
		expect(addBoolean).to.throw();
		expect(addUndefined).to.throw();
	});

});
