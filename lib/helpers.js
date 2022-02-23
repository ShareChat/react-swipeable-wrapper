const isPassiveSupported = () => {
	let supportsPassive = false;
	try {
		const opts = Object.defineProperty({}, "passive", {
			get() {
				supportsPassive = true;
				return supportsPassive;
			},
		});
		if (typeof window === "undefined") {
			return false;
		}
		window.addEventListener("testPassive", null, opts);
		window.removeEventListener("testPassive", null, opts);
	} catch (e) {
		// console.log(e);
	}

	return supportsPassive;
};

// eslint-disable-next-line import/prefer-default-export
export const supportsPassive = isPassiveSupported() ? { passive: true } : false;

const calcEndPoint = (target, context, offset = 0) => {
	const x = context.scrollLeft - context.getBoundingClientRect().left;
	const distance = target.getBoundingClientRect().left + x;
	return distance + offset;
};

const easeOutCubic = t => (t - 1) * (t - 1) * (t - 1) + 1;

const setPosition = (begin, end, elapsed, duration) =>
	elapsed > duration
		? end
		: begin + (end - begin) * easeOutCubic(elapsed / duration);

export const smoothScroll = (
	target,
	{ duration = 500, context = window, offset = 0, callback = () => {} } = {},
) => {
	if (typeof window !== "object") return;
	const start = context.scrollLeft;
	const end = calcEndPoint(target, context, offset);
	const clock = performance.now();

	const tick = () => {
		const elapsed = performance.now() - clock;
		const pos = setPosition(start, end, elapsed, duration);
		context.scrollLeft = pos;

		if (elapsed > duration) {
			callback(target);
		} else {
			requestAnimationFrame(tick);
		}
	};

	tick();
};
