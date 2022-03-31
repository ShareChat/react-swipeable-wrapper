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
        const prevIndex = previousIndex.current;
        const currIndex = index.current;
        rAF(() => {
          onSlideChange(index.current);
          scrollToTop();
          const { current: el = null } = elementRef;
          if (el) {
            const height = window.innerHeight - el.clientTop;
            el.children[prevIndex].style.height = `${height}px`;
            el.children[currIndex].style.height = "auto";
          }
        });
        previousIndex.current = index.current;
      }
    }, [onSlideChange, rAF]);

    const swipeToIndex = useCallback(
      (slideToIndex, avoidAnimation = false) => {
        rAF(() => {
          elementRef.current.style.transitionDuration = !avoidAnimation
            ? `${transitionDuration / 1000}s`
            : "0s";
          if (bottomBarRef?.current) {
            bottomBarRef.current.style.transitionDuration = !avoidAnimation
              ? `${transitionDuration / 1000}s`
              : "0s";
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

    const recalculateStyles = useCallback(() => {
      const { current: el = null } = elementRef;
      if (el) {
        totalWidth.current = Math.min(
          el.parentElement.offsetWidth,
          window.innerWidth,
        );
        const height = window.innerHeight - el.clientTop;
        for (let i = 0; i < children.length; i += 1) {
          el.children[i].style.height =
            initialIndex === i ? "auto" : `${height}px`;
        }
      }
    }, [children.length, initialIndex]);

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
        el.ontransitionend = onRestFn;
      }
      return () => {
        el.ontransitionend = () => {};
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
                willChange: "height",
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
    current: PropTypes.oneOf([PropTypes.node, PropTypes.object]),
  }),
  initialIndex: PropTypes.number,
  onSlideChange: PropTypes.func,
  children: PropTypes.node.isRequired,
  filterNodes: PropTypes.arrayOf(PropTypes.string),
  transitionDuration: PropTypes.number,
  transitionTimingFunction: PropTypes.string,
  containerStyles: PropTypes.shape({}),
};

SwipeableWrapper.defaultProps = {
  bottomBarRef: null,
  onSlideChange: () => {},
  initialIndex: 0,
  filterNodes: [],
  transitionDuration: 300,
  transitionTimingFunction: "ease-out",
  containerStyles: {},
};

export default memo(SwipeableWrapper);
