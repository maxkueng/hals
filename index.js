exports = module.exports = createHals;

function createHals (options) {

	options = options || {};

	var hals = {

		tasks: [],
		running: 0,
		capacity: options.capacity || null,
		concurrency: options.concurrency || 1,
		drain: options.drain,

		push: function (task) {
			if (typeof task !== 'function') {
				throw new Error('Only functions can be pushed to hals');
			}

			if (hals.capacity !== null && hals.tasks.length >= hals.capacity) { return; }

			hals.tasks.push(task);
			process.nextTick(hals.run);
		},

		run: function () {
			if (hals.tasks.length && hals.running < hals.concurrency) {
				hals.running += 1;
				var task = hals.tasks.shift();

				var next = function () {
					hals.running -= 1;

					if (typeof hals.drain === 'function' && hals.tasks.length + hals.running === 0) {
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
