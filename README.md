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

![Example](https://raw.githubusercontent.com/ShareChat/react-swipeable-wrapper/master/static/example.gif?token=GHSAT0AAAAAABORN6DOZK4GEJ5SP55MXDZ6YRO3DJA)

## Usage

```jsx
import React, { useCallback, useRef, useState } from "react";

import SwipeableWrapper from "react-swipeable-wrapper";

const tabs = ["Tab 1", "Tab 2", "Tab 3"];
const initialIndex = 0;

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
  tabsParent: {
    width: "50%",
  },
  tabs: {
    display: "flex",
    justifyContent: "space-around",
    height: "2rem",
  },
  bottomBar: {
    height: "4px",
    borderTopRightRadius: "50px 20px",
    borderTopLeftRadius: "50px 20px",
    background: "#000080",
    width: `${100 / tabs.length}%`,
  },
  nonSelectedTab: {
    color: "#DE3163",
  },
  selectedTab: {
    color: "#000080",
  },
};

const App = () => {
  const swipeRef = useRef(null);
  const bottomBarRef = useRef(null);

  const [currentSlideIdx, setSlideIdx] = useState(initialIndex);

  const onTabClick = useCallback(currentIndex => {
    const { getCurrentIndex, swipeToIndex } = swipeRef?.current ?? {};
    const previousIndex = getCurrentIndex();
    if (currentIndex !== previousIndex) swipeToIndex(currentIndex);
  }, []);

  const handleSlideChange = currentIndex => {
    setSlideIdx(currentIndex);
  };

  return (
    <div>
      <div style={styles.parent}>
        <div style={styles.tabsParent}>
          <div style={styles.tabs}>
            {tabs.map((tab, idx) => (
              <div
                key={tab}
                onClick={() => onTabClick(idx)}
                style={
                  currentSlideIdx === idx
                    ? styles.selectedTab
                    : styles.nonSelectedTab
                }
              >
                {tab}
              </div>
            ))}
          </div>
          <div ref={bottomBarRef} style={styles.bottomBar} />
        </div>
        <SwipeableWrapper
          ref={swipeRef}
          initialIndex={initialIndex}
          onSlideChange={handleSlideChange}
          bottomBarRef={bottomBarRef}
        >
          <div style={{ ...styles.slide, ...styles.slide1 }}>1st slide</div>
          <div style={{ ...styles.slide, ...styles.slide2 }}>2nd slide</div>
          <div style={{ ...styles.slide, ...styles.slide3 }}>3rd slide</div>
        </SwipeableWrapper>
      </div>
    </div>
  );
};
```

## SwipeableWrapper Props

| Parameter                  | Type                                | Default    | Description                                                   |
| :------------------------- | :---------------------------------- | :--------- | :------------------------------------------------------------ |
| `bottomBarRef`             | `React.RefObject<HTMLInputElement>` | `null`     | Ref applied on div that'll behave as bottom bar.              |
| `onSlideChange`            | `function`                          | `() => {}` | Each time a slide is changed, this function will be executed. |
| `initialIndex`             | `number`                            | `0`        | Index of the slide to be displayed on the initial mount.      |
| `filterNodes`              | `Array`                             | `[]`       | Node identifiers that will not accept swipes.                 |
| `transitionDuration`       | `number`                            | `300`      | Duration of the transition.                                   |
| `transitionTimingFunction` | `string`                            | `ease-out` | Timing function of the transition.                            |

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
