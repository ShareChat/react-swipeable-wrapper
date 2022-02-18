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
	return (
		<div>
			<div style={styles.parent}>
				<SwipeTabsWrapper
					swipeRef={swipeRef}
					ref={tabsRef}
					tabs={["Tab 1", "Tab 2", "Tab 3"]}
					bottomBarStyles={styles.bottomBar}
					tabStyles={styles.tabs}
					selectedTabStyles={styles.selectedTabs}
				/>
				<SwipeableWrapper tabsRef={tabsRef} ref={swipeRef}>
					<div style={{ ...styles.slide, ...styles.slide1 }}>1st slide</div>
					<div style={{ ...styles.slide, ...styles.slide2 }}>2nd slide</div>
					<div style={{ ...styles.slide, ...styles.slide3 }}>3rd slide</div>
				</SwipeableWrapper>
			</div>
		</div>
	);
};

export default App;
