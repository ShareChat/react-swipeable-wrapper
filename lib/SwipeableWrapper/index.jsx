/* eslint-disable no-param-reassign */
/* eslint-disable react/no-array-index-key */
/* eslint-disable no-unsafe-optional-chaining */
import React, {
	useCallback,
	forwardRef,
	useRef,
	useImperativeHandle,
	useLayoutEffect,
	memo,
} from "react";
import PropTypes from "prop-types";
import { useSpring, animated } from "@react-spring/web";
import { useDrag } from "@use-gesture/react";
import { raf } from "../helpers";

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
		},
		ref,
	) => {
		const elementRef = useRef(null);
		const index = useRef(initialIndex);
		const previousIndex = useRef(initialIndex);
		const totalWidth = useRef(0);

		const onRestFn = useCallback(
			({ finished }) => {
				if (finished && previousIndex.current !== index.current) {
					onSlideChange(index.current);
					scrollToTop();
					const height = innerHeight - (elementRef.current.clientTop || 100);
					elementRef.current.children[
						previousIndex.current
					].style.height = `${height}px`;
					elementRef.current.children[index.current].style.height = "auto";
					previousIndex.current = index.current;
				}
			},
			[onSlideChange],
		);

		const [{ x }, set] = useSpring(() => ({
			x: -index.current * totalWidth.current,
			onRest: onRestFn,
		}));

		const swipeToIndex = slideToIndex => {
			set.start({
				x: -slideToIndex * totalWidth.current,
				config: {
					mass: 0.3,
					friction: 8,
					tension: 60,
				},
			});
			if (bottomBarRef?.current) {
				raf(() => {
					bottomBarRef.current.style.transition = "0.3s ease-out";
					bottomBarRef.current.style.transform = `translateX(${
						100 * slideToIndex
					}%)`;
				});
			}
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
					set.set({
						x:
							(dirX ? -1 : 1) * moveToPoint -
							index.current * totalWidth.current,
					});
					if (bottomBarRef?.current) {
						const moveX = moveToPoint / totalWidth.current;
						raf(() => {
							bottomBarRef.current.style.transition = "none";
							bottomBarRef.current.style.transform = `translateX(${
								((dirX ? 1 : -1) * moveX + index.current) * 100
							}%)`;
						});
					}
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
			if (elementRef.current) {
				totalWidth.current = elementRef.current.parentElement.offsetWidth;
				const height = innerHeight - (elementRef.current.clientTop || 100);
				for (let i = 0; i < children.length; i++)
					elementRef.current.children[i].style.height =
						initialIndex === i ? "auto" : `${height}px`;
			}
		}, []);

		return (
			<div style={{ overflow: "hidden", width: "inherit" }}>
				<animated.div
					{...bind()}
					style={{
						x,
						width: `${children.length * 100}%`,
						display: "flex",
						touchAction: "none",
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
				</animated.div>
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
};

SwipeableWrapper.defaultProps = {
	bottomBarRef: null,
	onSlideChange: () => {},
	initialIndex: 0,
	filterNodes: [],
	hideOtherTabs: false,
};

export default memo(SwipeableWrapper);
