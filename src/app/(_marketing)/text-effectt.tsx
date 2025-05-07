"use client";

import React, { useRef, ReactNode, forwardRef } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(SplitText, ScrollTrigger);

interface TxtEffctProps {
  children: ReactNode;
  animateOnScroll?: boolean;
  delay?: number;
  duration?: number;
  staggerAmount?: number;
  ease?: string;
  startThreshold?: string;
  onComplete?: () => void;
}

const TxtEffct = forwardRef<HTMLDivElement, TxtEffctProps>(
  (
    {
      children,
      animateOnScroll = true,
      delay = 0,
      duration = 1,
      staggerAmount = 0.1,
      ease = "power4.out",
      startThreshold = "top 75%",
      onComplete,
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const elementRef = useRef<HTMLElement[]>([]);
    const splitRef = useRef<SplitText[]>([]);
    const lines = useRef<HTMLElement[]>([]);

    // Merge refs if an external ref is provided
    React.useEffect(() => {
      if (!ref) return;

      if (typeof ref === "function") {
        ref(containerRef.current);
      } else {
        (ref as React.MutableRefObject<HTMLDivElement | null>).current =
          containerRef.current;
      }
    }, [ref]);

    useGSAP(
      () => {
        if (!containerRef.current) return;

        // Clear previous refs
        splitRef.current = [];
        elementRef.current = [];
        lines.current = [];

        // Find all elements to animate
        let elements: HTMLElement[] = [];
        if (containerRef.current.hasAttribute("data-txteffct-wrapper")) {
          elements = Array.from(containerRef.current.children) as HTMLElement[];
        } else {
          elements = [containerRef.current];
        }

        // Process each element
        elements.forEach((element) => {
          elementRef.current.push(element);

          const split = new SplitText(element, {
            type: "lines",
            linesClass: "txteffct-line",
          });

          splitRef.current.push(split);

          // Handle text-indent property
          const computedStyle = window.getComputedStyle(element);
          const textIndent = computedStyle.textIndent;

          if (textIndent && textIndent !== "0px") {
            if (split.lines.length > 0) {
              (split.lines[0] as HTMLElement).style.paddingLeft = textIndent;
            }
            element.style.textIndent = "0px";
          }

          lines.current.push(...(split.lines as HTMLElement[]));
        });

        // Set initial state
        gsap.set(lines.current, { y: "100%", opacity: 0 });

        // Create animation configuration
        const animationProps = {
          y: "0%",
          opacity: 1,
          duration,
          stagger: staggerAmount,
          ease,
          delay,
          onComplete,
        };

        // Apply animation
        if (animateOnScroll) {
          gsap.to(lines.current, {
            ...animationProps,
            scrollTrigger: {
              trigger: containerRef.current,
              start: startThreshold,
              once: true,
            },
          });
        } else {
          gsap.to(lines.current, animationProps);
        }

        // Cleanup on unmount
        return () => {
          splitRef.current.forEach((split) => {
            if (split) {
              split.revert();
            }
          });
        };
      },
      {
        scope: containerRef,
        dependencies: [
          animateOnScroll,
          delay,
          duration,
          staggerAmount,
          ease,
          startThreshold,
        ],
      }
    );

    // Handle single child case
    if (React.Children.count(children) === 1) {
      const child = React.Children.only(children);

      if (React.isValidElement(child)) {
        const childType = child.type;

        if (
          typeof childType === "string" ||
          (typeof childType === "function" &&
            ((childType as any).prototype?.isReactComponent || // Class component
              (child as any).type.$typeof === Symbol.for("react.forward_ref"))) // forwardRef component
        ) {
          // Clone with ref and possibly updated className
          return React.cloneElement(child, {
            ref: containerRef,
          } as React.Attributes & { ref: React.Ref<any>; className?: string });
        }
      }
      return child;
    }

    // Handle multiple children case
    return (
      <div ref={containerRef} data-txteffct-wrapper="true">
        {children}
      </div>
    );
  }
);

// Add display name for better debugging
TxtEffct.displayName = "TxtEffct";

export default TxtEffct;
