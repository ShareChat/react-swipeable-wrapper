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
      transitionDuration,
      transitionTimingFunction,
      containerStyles,
      disableAutoScroll,
      disableAutoAdjustHeight,
    },
    ref,
  ) => {
    const elementRef = useRef(null);
    const index = useRef(initialIndex);
    const previousIndex = useRef(initialIndex);
    const totalWidth = useRef(0);
    const totalHeight = useRef(0);
    const rAF = useRaf();

    const onRestFn = useCallback(() => {
      if (previousIndex.current !== index.current) {
        const prevIndex = previousIndex.current;
        const currIndex = index.current;
        rAF(() => {
          onSlideChange(index.current);
          if (!disableAutoScroll) scrollToTop();
          const { current: el = null } = elementRef;
          if (el && !disableAutoAdjustHeight && el.children.length > 0) {
            el.children[prevIndex].style.height = `${totalHeight.current}px`;
            el.children[currIndex].style.height = "auto";
          }
        });
        previousIndex.current = index.current;
      }
    }, [disableAutoAdjustHeight, disableAutoScroll, onSlideChange, rAF]);

    const swipeToIndex = useCallback(
      (slideToIndex, avoidAnimation = false) => {
        rAF(() => {
          const { current: el = null } = elementRef;
          if (el) {
            el.style.transitionDuration = !avoidAnimation
              ? `${transitionDuration / 1000}s`
              : "0s";
            const { current: bottomBarEl = null } = bottomBarRef;
            if (bottomBarEl) {
              bottomBarEl.style.transitionDuration = !avoidAnimation
                ? `${transitionDuration / 1000}s`
                : "0s";
              bottomBarEl.style.transform = `translate3d(${
                100 * slideToIndex
              }%, 0px, 0px)`;
            }
            el.style.transform = `translate3d(${
              -slideToIndex * totalWidth.current
            }px, 0px, 0px)`;
          }
        });
        if (index.current === slideToIndex) return;
        index.current = slideToIndex;
      },
      [bottomBarRef, rAF, transitionDuration],
    );

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
            const { current: el = null } = elementRef;
            if (el) {
              if (el.style.transitionDuration !== "0s")
                el.style.transitionDuration = "0s";
              const { current: bottomBarEl = null } = bottomBarRef;
              if (bottomBarEl) {
                const moveX = moveToPoint / totalWidth.current;
                if (bottomBarEl.style.transitionDuration !== "0s")
                  bottomBarEl.style.transitionDuration = "0s";
                bottomBarEl.style.transform = `translate3d(${
                  ((dirX ? 1 : -1) * moveX + index.current) * 100
                }%, 0px, 0px)`;
              }
              el.style.transform = `translate3d(${
                (dirX ? -1 : 1) * moveToPoint -
                index.current * totalWidth.current
              }px, 0px, 0px)`;
            }
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

    const recalculateStyles = useCallback(() => {
      const { current: el = null } = elementRef;
      if (el) {
        totalWidth.current = Math.min(
          el.parentElement.offsetWidth,
          window.innerWidth,
        );
        if (!disableAutoAdjustHeight) {
          totalHeight.current =
            window.innerHeight - Math.max(el.offsetTop, el.clientTop);
          for (let i = 0; i < children.length; i += 1) {
            el.children[i].style.height =
              initialIndex === i ? "auto" : `${totalHeight.current}px`;
          }
        }
      }
    }, [children.length, disableAutoAdjustHeight, initialIndex]);

    useLayoutEffect(() => {
      swipeToIndex(initialIndex, true);
      recalculateStyles();
      window.addEventListener("resize", recalculateStyles);
      return () => {
        window.removeEventListener("resize", recalculateStyles);
      };
    }, [initialIndex, recalculateStyles, swipeToIndex]);

    useLayoutEffect(() => {
      if (bottomBarRef?.current) {
        bottomBarRef.current.style.transition = "transform";
        bottomBarRef.current.style.transitionTimingFunction =
          transitionTimingFunction;
      }
    }, [bottomBarRef, transitionTimingFunction]);

    useLayoutEffect(() => {
      const { current: el = null } = elementRef;
      if (el) {
        el.addEventListener("transitionend", onRestFn);
      }
      return () => {
        el.removeEventListener("transitionend", onRestFn);
      };
    }, [onRestFn]);

    return (
      <div style={{ width: "inherit", overflow: "hidden", ...containerStyles }}>
        <div
          {...bind()}
          style={{
            width: `${children.length * 100}%`,
            display: "flex",
            transition: "transform",
            transitionTimingFunction,
            willChange: "transform",
          }}
          ref={elementRef}
        >
          {children.map((child, loopIndex) => (
            <div
              key={`tabs-${loopIndex}`}
              style={{
                width: `${100 / children.length}%`,
                ...(!disableAutoAdjustHeight ? { willChange: "height" } : {}),
              }}
            >
              {child}
            </div>
          ))}
        </div>
      </div>
    );
  },
);

SwipeableWrapper.propTypes = {
  bottomBarRef: PropTypes.shape({
    current: PropTypes.oneOfType([
      PropTypes.node,
      PropTypes.objectOf(PropTypes.object),
    ]),
  }),
  initialIndex: PropTypes.number,
  onSlideChange: PropTypes.func,
  children: PropTypes.node.isRequired,
  filterNodes: PropTypes.arrayOf(PropTypes.string),
  transitionDuration: PropTypes.number,
  transitionTimingFunction: PropTypes.string,
  containerStyles: PropTypes.shape({}),
  disableAutoScroll: PropTypes.bool,
  disableAutoAdjustHeight: PropTypes.bool,
};

SwipeableWrapper.defaultProps = {
  bottomBarRef: { current: null },
  onSlideChange: () => {},
  initialIndex: 0,
  filterNodes: [],
  transitionDuration: 300,
  transitionTimingFunction: "ease-out",
  containerStyles: {},
  disableAutoScroll: false,
  disableAutoAdjustHeight: false,
};

export default memo(SwipeableWrapper);
