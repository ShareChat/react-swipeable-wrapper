# react-swipeable-wrapper

> A React component for swipeable views.

| Package                 | Version                                                                                                                           |
| ----------------------- | :-------------------------------------------------------------------------------------------------------------------------------- |
| react-swipeable-wrapper | [![npm version](https://img.shields.io/npm/v/react-swipeable-wrapper.svg)](https://www.npmjs.com/package/react-swipeable-wrapper) |

## Installation

```sh
npm install --save react-swipeable-wrapper
or
yarn add react-swipeable-wrapper
```

## Example

#### [Github Pages Demo](https://sharechat.github.io/react-swipeable-wrapper)

![Example](/static/example.gif)

## Usage

```jsx
import { useRef } from "react";

import { SwipeableWrapper, SwipeTabsWrapper } from "react-swipeable-wrapper";

const styles = {
	parent: {
		maxWidth: 800,
		margin: "auto",
		marginTop: "10em",
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

function MySlides() {
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
}

export default MySlides;
```

## SwipeableWrapper Props

| Parameter       | Type                                | Default    | Description                                                   |
| :-------------- | :---------------------------------- | :--------- | :------------------------------------------------------------ |
| `tabsRef`       | `React.RefObject<HTMLInputElement>` | `null`     | Ref applied on `SwipeTabsWrapper` component.                  |
| `onSlideChange` | `function`                          | `() => {}` | Each time a slide is changed, this function will be executed. |
| `initialIndex`  | `number`                            | `0`        | Index of the slide to be displayed on the inital mount.       |
| `filterNodes`   | `Array`                             | `[]`       | Node identifiers that will not accept swipes                  |
| `hideOtherTabs` | `boolean`                           | `false`    | Slides that are not in view will be hidden                    |

## SwipeTabsWrapper Props

| Parameter           | Type                                | Default | Description                                                |
| :------------------ | :---------------------------------- | :------ | :--------------------------------------------------------- |
| `swipeRef`          | `React.RefObject<HTMLInputElement>` |         | **Required**. Ref applied on `SwipeableWrapper` component. |
| `tabs`              | `Array`                             |         | **Required**. Array of tabs names                          |
| `tabStyles`         | `object`                            | `{}`    | Styles of non selected tab                                 |
| `selectedTabStyles` | `object`                            | `{}`    | Styles of selected tab                                     |
| `bottomBarStyles`   | `object`                            | `{}`    | Styles of bottom bar                                       |
| `tabsWrapperStyles` | `object`                            | `{}`    | Styles of tabs wrapper                                     |

## Functions

#### `swipeToIndex`: This function lets you switch between slides.

```jsx
swipeRef.current.swipeToIndex(indexOfSlide);
```

#### `getCurrentIndex`: This function returns the index of the slide your are on.

```jsx
const currentSlide = swipeRef.current.getCurrentIndex();
```

## License

This project is licensed under the terms of the
[MIT license](https://github.com/Sharechat/react-swipeable-wrapper/blob/master/LICENSE).
[![MIT License](https://img.shields.io/apm/l/atomic-design-ui.svg?)](https://github.com/Sharechat/react-swipeable-wrapper/blob/master/LICENSE)
