/* eslint-disable react/no-array-index-key */
import React, { useRef } from "react";

import { SwipeableWrapper, SwipeTabsWrapper } from "react-swipeable-wrapper";

const styles = {
	parent: {
		maxWidth: 800,
		margin: "auto",
		paddingTop: "10em",
		overflow: "hidden",
	},
	text: {
		padding: "1em 2px",
		fontStyle: "bold",
	},
	slide: {
		padding: 15,
		minHeight: 400,
		color: "#fff",
	},
	slide1: {
		background: "#40E0D0",
	},
	slide2: {
		background: "#9FE2BF",
	},
	slide3: {
		background: "#FFBF00",
	},
	bottomBar: {
		height: "4px",
		borderTopRightRadius: "50px 20px",
		borderTopLeftRadius: "50px 20px",
		background: "#000080",
	},
	tabs: {
		color: "#DE3163",
	},
	selectedTabs: {
		color: "#6495ED",
	},
};

const App = () => {
	const swipeRef = useRef(null);
	const tabsRef = useRef(null);
	const numberOfSlides = 3;
	return (
		<div>
			<div style={styles.parent}>
				<SwipeTabsWrapper
					swipeRef={swipeRef}
					ref={tabsRef}
					tabs={[...Array(numberOfSlides).keys()].map((_, i) => `Tab ${i + 1}`)}
					bottomBarStyles={styles.bottomBar}
					tabStyles={styles.tabs}
					selectedTabStyles={styles.selectedTabs}
				/>
				<SwipeableWrapper tabsRef={tabsRef} ref={swipeRef}>
					{[...Array(numberOfSlides).keys()].map((_, i) => (
						<div
							style={{ ...styles.slide, ...styles[`slide${(i % 3) + 1}`] }}
							key={i}
						>
							Slide {i + 1}
						</div>
					))}
				</SwipeableWrapper>
			</div>
		</div>
	);
};

export default App;
