import * as React from "react";

const raf =
	typeof window !== "undefined"
		? window.requestAnimationFrame ||
		  window.webkitRequestAnimationFrame ||
		  window.mozRequestAnimationFrame ||
		  window.msRequestAnimationFrame
		: cb => setTimeout(cb, 16);

export const useRaf = () => {
	const id = React.useRef(null);

	const rAF = React.useCallback(cb => {
		cancelAnimationFrame(id.current);
		id.current = raf(cb);
	}, []);

	React.useEffect(
		() => () => {
			cancelAnimationFrame(id.current);
		},
		[],
	);

	return rAF;
};

export const useLayoutEffect =
	typeof window !== "undefined" &&
	window.document &&
	window.document.createElement
		? React.useLayoutEffect
		: React.useEffect;
