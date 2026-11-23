import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { RoFocusLogo } from './RoFocusLogo';

interface IntroOverlayProps {
  onComplete: () => void;
  visitCount: number;
}

export const IntroOverlay: React.FC<IntroOverlayProps> = ({ onComplete, visitCount }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const linesRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline({ onComplete });
    const obj = { value: 0 };

    tl.fromTo('.intro-top', { opacity: 0, y: -24 }, { opacity: 1, y: 0, duration: .7, ease: 'power3.out' }, 0)
      .fromTo('.intro-kicker, .intro-note', { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: .7, stagger: .12, ease: 'power3.out' }, .35)
      .to(obj, {
        value: 100,
        duration: 2.5,
        ease: 'power2.inOut',
        onUpdate: () => {
          if (counterRef.current) counterRef.current.textContent = Math.round(obj.value).toString();
        }
      }, .2)
      .to(progressRef.current, { width: '100%', duration: 2.5, ease: 'power2.inOut' }, .2)
      .fromTo(counterRef.current, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: .8, ease: 'power3.out' }, .25)
      .to(linesRef.current, { opacity: 1, duration: .5 }, .4)
      .to({}, { duration: .35 })
      .to(containerRef.current, { yPercent: -100, duration: .8, ease: 'power4.inOut' });
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="intro-screen">
      <div className="intro-top">
        <RoFocusLogo size={34} variant="full" />
        <div className="intro-top-right">Reload {String(visitCount).padStart(2, '0')}</div>
      </div>

      <div className="intro-center">
        <div className="intro-kicker">Entering Flow State</div>
        <div className="intro-counter-row">
          <div className="intro-orbit" aria-hidden="true" />
          <span ref={counterRef} className="intro-counter">0</span>
          <span className="intro-percent">%</span>
        </div>
        <p ref={linesRef} className="intro-note">I commit to the time. I finish the work.</p>
      </div>

      <div className="intro-bottom">
        <div className="intro-bottom-labels">
          <span>System Initialization</span>
          <span>Ready</span>
        </div>
        <div className="intro-progress"><div ref={progressRef} className="intro-progress-fill" /></div>
      </div>
    </div>
  );
};

export default IntroOverlay;
