/* eslint-disable import/prefer-default-export */
export const raf =
	window.requestAnimationFrame ||
	window.webkitRequestAnimationFrame ||
	window.mozRequestAnimationFrame ||
	window.msRequestAnimationFrame ||
	(cb => setTimeout(cb, 16));
