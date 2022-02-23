/* eslint-disable react/no-array-index-key */
/* eslint-disable no-unsafe-optional-chaining */
import React, {
	forwardRef,
	useImperativeHandle,
	useRef,
	useEffect,
	useCallback,
	memo,
} from "react";
import PropTypes from "prop-types";

const applyStyles = (refEl, stylesToBeApplied = {}) => {
	if (!refEl) return;
	Object.entries(stylesToBeApplied).forEach(([name, value]) => {
		refEl.style[name] = value;
	});
};

const SwipeTabsWrapper = forwardRef(
	(
		{
			swipeRef,
			tabStyles,
			selectedTabStyles,
			bottomBarStyles,
			tabs,
			tabsWrapperStyles,
		},
		ref,
	) => {
		const tabsRef = useRef(null);
		const bottomBarRef = useRef(null);

		const timer = useRef(null);

		useEffect(
			() => () => {
				cancelAnimationFrame(timer.current);
			},
			[],
		);

		const changeTabsStyle = useCallback(
			(previousIndex, currentIndex) => {
				cancelAnimationFrame(timer.current);
				timer.current = requestAnimationFrame(() => {
					if (!tabsRef.current?.children) return;
					const currEl = tabsRef.current?.children[currentIndex];
					const prevEl = tabsRef.current?.children[previousIndex];
					applyStyles(prevEl, tabStyles);
					applyStyles(currEl, selectedTabStyles);
				});
			},
			[selectedTabStyles, tabStyles],
		);

		useImperativeHandle(ref, () => ({
			getBottomBarRef: () => bottomBarRef,
			changeTabsStyle,
			tabsClientWidth: () => tabsRef.current?.clientWidth,
		}));

		const onTabClick = currentIndex => {
			const previousIndex = swipeRef?.current?.getCurrentIndex();
			if (currentIndex !== previousIndex)
				// eslint-disable-next-line no-unused-expressions
				swipeRef?.current.swipeToIndex(currentIndex);
		};

		useEffect(() => {
			const index = swipeRef?.current?.getCurrentIndex();
			changeTabsStyle(index, index);
		}, [changeTabsStyle, swipeRef]);

		return (
			<div
				style={{
					position: "relative",
					display: "flex",
					flexDirection: "column",
					height: "2.5rem",
					width: "100%",
				}}
			>
				<div
					ref={tabsRef}
					style={{
						display: "flex",
						justifyContent: "space-around",
						...tabsWrapperStyles,
					}}
				>
					{tabs.map((text, idx) => (
						<div
							key={`slide-${idx}`}
							onClick={() => onTabClick(idx)}
							style={
								swipeRef?.current?.getCurrentIndex() === idx
									? selectedTabStyles
									: tabStyles
							}
						>
							{text}
						</div>
					))}
				</div>
				<div
					style={{
						width: `${100 / tabs.length}%`,
						height: "0.25rem",
						...bottomBarStyles,
						position: "absolute",
						bottom: "0px",
					}}
					ref={bottomBarRef}
				/>
			</div>
		);
	},
);

SwipeTabsWrapper.propTypes = {
	swipeRef: PropTypes.shape({
		current: PropTypes.shape({
			swipeToIndex: PropTypes.func,
			getCurrentIndex: PropTypes.func,
		}),
	}).isRequired,
	tabStyles: PropTypes.objectOf(PropTypes.any),
	selectedTabStyles: PropTypes.objectOf(PropTypes.any),
	bottomBarStyles: PropTypes.objectOf(PropTypes.any),
	tabs: PropTypes.arrayOf(PropTypes.string).isRequired,
	tabsWrapperStyles: PropTypes.objectOf(PropTypes.any),
};

SwipeTabsWrapper.defaultProps = {
	tabStyles: {},
	selectedTabStyles: {},
	bottomBarStyles: {},
	tabsWrapperStyles: {},
};

export default memo(SwipeTabsWrapper);
