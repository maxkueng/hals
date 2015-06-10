exports = module.exports = createHals;

function noop () {}

function createHals (options) {

	options = options || {};

	var hals = {

		tasks: [],
		running: 0,
		capacity: options.capacity || null,
		concurrency: options.concurrency || 1,
		drain: options.drain || noop,
		drop: options.drop || noop,

		usedCapacity: function () {
			return hals.tasks.length + hals.running;
		},

		hasCapacity: function () {
			if (hals.capacity === null) { return true; }

			return (hals.usedCapacity() < hals.capacity);
		}, 

		hasTasks: function () {
			return !!hals.tasks.length;
		},

		canRun: function () {
			return (hals.hasTasks() && hals.running < hals.concurrency);
		},

		push: function (task) {
			if (typeof task !== 'function') {
				throw new Error('Only functions can be pushed to hals');
			}

			if (!hals.hasCapacity()) {
				return hals.drop(hals.usedCapacity(), task);
			}

			hals.tasks.push(task);
			process.nextTick(hals.run);
		},

		run: function () {
			if (hals.canRun()) {
				hals.running += 1;
				var task = hals.tasks.shift();

				var next = function () {
					hals.running -= 1;

					if (hals.usedCapacity() === 0) {
						hals.drain();
					}

					process.nextTick(hals.run);
				};

				task.call(null, next);
			}
		},

	};

	return hals.push;
}
