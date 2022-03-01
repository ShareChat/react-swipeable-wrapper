/* eslint-disable no-param-reassign */
/* eslint-disable react/no-array-index-key */
/* eslint-disable no-unsafe-optional-chaining */
import React, {
	useCallback,
	forwardRef,
	useRef,
	useImperativeHandle,
	memo,
} from "react";
import PropTypes from "prop-types";
import { useDrag } from "@use-gesture/react";
import { useLayoutEffect, useRaf } from "../helpers";

const innerHeight = window?.innerHeight ?? 0;

const scrollToTop = () => {
	const isSmoothScrollSupported =
		"scrollBehavior" in document.documentElement.style;

	const scrollToOptions = {
		top: 0,
		left: 0,
		behavior: "smooth",
	};

	if (isSmoothScrollSupported) {
		window.scroll(scrollToOptions);
	} else {
		window.scroll(scrollToOptions.left, scrollToOptions.top);
	}
};

const checkParent = (el, filterIds) => {
	if (el === document) return false;
	if (filterIds.includes(el.id)) return true;
	return checkParent(el.parentNode, filterIds);
};

const SwipeableWrapper = forwardRef(
	(
		{
			bottomBarRef,
			initialIndex,
			onSlideChange,
			children,
			filterNodes,
			hideOtherTabs,
			transitionDuration,
			transitionTimingFunction,
		},
		ref,
	) => {
		const elementRef = useRef(null);
		const index = useRef(initialIndex);
		const previousIndex = useRef(initialIndex);
		const totalWidth = useRef(0);
		const rAF = useRaf();

		const onRestFn = useCallback(() => {
			if (previousIndex.current !== index.current) {
				rAF(() => {
					onSlideChange(index.current);
					scrollToTop();
					const height = innerHeight - elementRef.current.clientTop;
					elementRef.current.children[
						previousIndex.current
					].style.height = `${height}px`;
					elementRef.current.children[index.current].style.height = "auto";
				});
				previousIndex.current = index.current;
			}
		}, [onSlideChange, rAF]);

		const swipeToIndex = slideToIndex => {
			rAF(() => {
				elementRef.current.style.transitionDuration = `${
					transitionDuration / 1000
				}s`;
				if (bottomBarRef?.current) {
					bottomBarRef.current.style.transitionDuration = `${
						transitionDuration / 1000
					}s`;
					bottomBarRef.current.style.transform = `translate3d(${
						100 * slideToIndex
					}%, 0px, 0px)`;
				}
				elementRef.current.style.transform = `translate3d(${
					-slideToIndex * totalWidth.current
				}px, 0px, 0px)`;
			});
			if (index.current === slideToIndex) return;
			index.current = slideToIndex;
		};

		useImperativeHandle(ref, () => ({
			getCurrentIndex: () => index.current,
			swipeToIndex,
		}));

		const bind = useDrag(
			({ event, down, movement: [mx], velocity }) => {
				const shouldFilter =
					filterNodes.length > 0
						? checkParent(event.target, filterNodes)
						: false;

				if (shouldFilter) return;

				const dirX = mx < 0;
				if (down) {
					let moveToPoint = Math.abs(mx);
					if (
						(index.current === 0 && !dirX) ||
						(index.current === children.length - 1 && dirX)
					)
						moveToPoint = Math.min(moveToPoint, totalWidth.current / 4);
					rAF(() => {
						if (elementRef.current.style.transitionDuration !== "0s")
							elementRef.current.style.transitionDuration = "0s";
						if (bottomBarRef?.current) {
							const moveX = moveToPoint / totalWidth.current;
							if (bottomBarRef.current.style.transitionDuration !== "0s")
								bottomBarRef.current.style.transitionDuration = "0s";
							bottomBarRef.current.style.transform = `translate3d(${
								((dirX ? 1 : -1) * moveX + index.current) * 100
							}%, 0px, 0px)`;
						}
						elementRef.current.style.transform = `translate3d(${
							(dirX ? -1 : 1) * moveToPoint - index.current * totalWidth.current
						}px, 0px, 0px)`;
					});
				} else if (!down) {
					const slideToIndex = index.current + (dirX ? 1 : -1);
					swipeToIndex(
						(Math.abs(mx) >= totalWidth.current / 20 || velocity > 1.75) &&
							slideToIndex >= 0 &&
							slideToIndex < children.length
							? slideToIndex
							: index.current,
					);
				}
			},
			{
				axis: "x",
				filterTaps: true,
				pointer: { touch: true },
			},
		);
		useLayoutEffect(() => {
			if (bottomBarRef?.current) {
				bottomBarRef.current.style.transition = "transform";
				bottomBarRef.current.style.transitionTimingFunction =
					transitionTimingFunction;
			}
			const el = elementRef?.current;
			if (el) {
				totalWidth.current = el.parentElement.offsetWidth;
				const height = innerHeight - (el.clientTop || 100);
				for (let i = 0; i < children.length; i++) {
					el.children[i].style.height =
						initialIndex === i ? "auto" : `${height}px`;
				}
				el.ontransitionend = onRestFn;
			}
			return () => {
				el.ontransitionend = () => {};
			};
		}, []);

		return (
			<div style={{ overflow: "hidden", width: "inherit" }}>
				<div
					{...bind()}
					style={{
						width: `${children.length * 100}%`,
						display: "flex",
						touchAction: "none",
						transition: "transform",
						transitionTimingFunction,
						willChange: "transform, height",
					}}
					ref={elementRef}
				>
					{children.map((child, loopIndex) => (
						<div
							key={`tabs-${loopIndex}`}
							style={{ width: `${100 / children.length}%` }}
						>
							{hideOtherTabs
								? loopIndex === index.current
									? child
									: null
								: child}
						</div>
					))}
				</div>
			</div>
		);
	},
);

SwipeableWrapper.propTypes = {
	bottomBarRef: PropTypes.shape({
		current: PropTypes.objectOf(PropTypes.object),
	}),
	initialIndex: PropTypes.number,
	onSlideChange: PropTypes.func,
	children: PropTypes.node.isRequired,
	filterNodes: PropTypes.arrayOf(PropTypes.string),
	hideOtherTabs: PropTypes.bool,
	transitionDuration: PropTypes.number,
	transitionTimingFunction: PropTypes.string,
};

SwipeableWrapper.defaultProps = {
	bottomBarRef: null,
	onSlideChange: () => {},
	initialIndex: 0,
	filterNodes: [],
	hideOtherTabs: false,
	transitionDuration: 300,
	transitionTimingFunction: "ease-out",
};

export default memo(SwipeableWrapper);
