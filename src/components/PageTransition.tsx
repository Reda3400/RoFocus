import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

interface PageTransitionProps {
  isTransitioning: boolean;
  targetTitle: string;
  direction?: 'left' | 'right' | 'top' | 'bottom';
  onMidpoint: () => void;
  onTransitionFinished: () => void;
}

export const PageTransition: React.FC<PageTransitionProps> = ({
  isTransitioning,
  targetTitle,
  direction = 'bottom',
  onMidpoint,
  onTransitionFinished
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const kickerRef = useRef<HTMLDivElement>(null);
  const ruleRef = useRef<HTMLDivElement>(null);
  const indexRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!isTransitioning) return;

    // The overlay enters from the chosen side and leaves through the opposite one.
    const axis = direction === 'left' || direction === 'right' ? 'xPercent' : 'yPercent';
    const enter = direction === 'left' || direction === 'top' ? -104 : 104;
    const exit = -enter;

    const tl = gsap.timeline({ defaults: { ease: 'expo.inOut' } });
    tl.set(overlayRef.current, { display: 'flex', visibility: 'visible' })
      .fromTo(overlayRef.current, { [axis]: enter }, { [axis]: 0, duration: 0.9, ease: 'expo.inOut' })
      .fromTo(
        [kickerRef.current, indexRef.current],
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.55, stagger: 0.06, ease: 'power3.out' },
        '-=0.45'
      )
      .fromTo(
        titleRef.current,
        { opacity: 0, y: 64, skewY: 2 },
        { opacity: 1, y: 0, skewY: 0, duration: 0.75, ease: 'power4.out' },
        '-=0.5'
      )
      .fromTo(
        ruleRef.current,
        { scaleX: 0, opacity: 0 },
        { scaleX: 1, opacity: 1, duration: 0.7, ease: 'power3.out' },
        '-=0.55'
      )
      .call(onMidpoint, undefined, '-=0.08')
      .to({}, { duration: 0.18 })
      .to(
        innerRef.current,
        { opacity: 0, y: -24, duration: 0.35, ease: 'power2.in' },
        '+=0.02'
      )
      .to(overlayRef.current, { [axis]: exit, duration: 0.95, ease: 'expo.inOut' }, '-=0.1')
      .set(overlayRef.current, { display: 'none' })
      .call(onTransitionFinished);
  }, [isTransitioning, direction]);

  if (!isTransitioning) return null;

  return (
    <div ref={overlayRef} className="transition-screen" aria-hidden="true">
      <div ref={innerRef} className="transition-inner">
        <div className="transition-meta">
          <div ref={kickerRef} className="transition-kicker">RoFocus / Navigate</div>
          <div ref={indexRef} className="transition-index">Next View</div>
        </div>
        <div ref={titleRef} className="transition-title">{targetTitle}</div>
        <div ref={ruleRef} className="transition-rule" />
      </div>
    </div>
  );
};

export default PageTransition;
