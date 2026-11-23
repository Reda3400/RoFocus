import React, { useEffect, useRef } from 'react';
import { Minus, Plus } from 'lucide-react';
import { wheelSoundService } from '../utils/wheelSound';

const ROW_HEIGHT = 48;
const PRESETS = [
  { label: '25 min', h: 0, m: 25 },
  { label: '45 min', h: 0, m: 45 },
  { label: '1 hr', h: 1, m: 0 },
  { label: '1.5 hr', h: 1, m: 30 },
  { label: '2 hr', h: 2, m: 0 }
];

interface DurationPickerProps {
  hours: number;
  minutes: number;
  onChange: (hours: number, minutes: number) => void;
  soundEnabled: boolean;
}

export const DurationPicker: React.FC<DurationPickerProps> = ({
  hours,
  minutes,
  onChange,
  soundEnabled
}) => {
  const hoursList = Array.from({ length: 13 }, (_, i) => i);
  const minutesList = Array.from({ length: 12 }, (_, i) => i * 5);

  const hoursRef = useRef<HTMLDivElement>(null);
  const minutesRef = useRef<HTMLDivElement>(null);
  const lastScrolledHour = useRef<number>(hours);
  const lastScrolledMin = useRef<number>(minutes);
  const suppressScroll = useRef(false);

  const scrollToValue = (h: number, m: number, behavior: ScrollBehavior = 'smooth') => {
    suppressScroll.current = true;
    if (hoursRef.current) hoursRef.current.scrollTo({ top: h * ROW_HEIGHT, behavior });
    if (minutesRef.current) minutesRef.current.scrollTo({ top: (m / 5) * ROW_HEIGHT, behavior });
    window.setTimeout(() => { suppressScroll.current = false; }, behavior === 'smooth' ? 220 : 0);
  };

  useEffect(() => {
    scrollToValue(hours, minutes, 'auto');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const commit = (h: number, m: number, tick = true) => {
    const nextH = Math.max(0, Math.min(12, h));
    const nextM = Math.max(0, Math.min(55, Math.round(m / 5) * 5));
    if (tick && soundEnabled && (nextH !== hours || nextM !== minutes)) wheelSoundService.playTick();
    onChange(nextH, nextM);
    scrollToValue(nextH, nextM);
  };

  const handleHoursScroll = () => {
    if (!hoursRef.current || suppressScroll.current) return;
    const index = Math.max(0, Math.min(Math.round(hoursRef.current.scrollTop / ROW_HEIGHT), hoursList.length - 1));
    const selectedH = hoursList[index];
    if (selectedH !== hours) {
      if (selectedH !== lastScrolledHour.current) {
        lastScrolledHour.current = selectedH;
        if (soundEnabled) wheelSoundService.playTick();
      }
      onChange(selectedH, minutes);
    }
  };

  const handleMinutesScroll = () => {
    if (!minutesRef.current || suppressScroll.current) return;
    const index = Math.max(0, Math.min(Math.round(minutesRef.current.scrollTop / ROW_HEIGHT), minutesList.length - 1));
    const selectedM = minutesList[index];
    if (selectedM !== minutes) {
      if (selectedM !== lastScrolledMin.current) {
        lastScrolledMin.current = selectedM;
        if (soundEnabled) wheelSoundService.playTick();
      }
      onChange(hours, selectedM);
    }
  };

  const totalMinutes = hours * 60 + minutes;
  const display = `${hours > 0 ? `${hours}h ` : ''}${String(minutes).padStart(hours > 0 ? 2 : 1, '0')}m`;

  return (
    <div className="duration-picker select-none">
      <div className="duration-display">
        <div className="duration-display-label">Session length</div>
        <div className="duration-display-value">{display}</div>
        <div className="duration-display-total">{totalMinutes} minutes total</div>
      </div>

      <div className="duration-presets" aria-label="Quick duration presets">
        {PRESETS.map(preset => {
          const active = preset.h === hours && preset.m === minutes;
          return (
            <button
              key={preset.label}
              type="button"
              onClick={() => commit(preset.h, preset.m)}
              className={`duration-preset ${active ? 'is-active' : ''}`}
            >
              {preset.label}
            </button>
          );
        })}
      </div>

      <div className="duration-wheels">
        <div className="duration-wheel-col">
          <div className="duration-wheel-head">
            <span>Hours</span>
            <div className="duration-stepper">
              <button type="button" className="duration-step" onClick={() => commit(hours - 1, minutes)} aria-label="Decrease hours"><Minus size={14} /></button>
              <button type="button" className="duration-step" onClick={() => commit(hours + 1, minutes)} aria-label="Increase hours"><Plus size={14} /></button>
            </div>
          </div>
          <div className="duration-wheel-frame">
            <div className="duration-wheel-highlight" aria-hidden="true" />
            <div
              ref={hoursRef}
              onScroll={handleHoursScroll}
              className="duration-wheel scrollbar-none"
              tabIndex={0}
              aria-label="Hours"
            >
              {hoursList.map(h => (
                <button
                  type="button"
                  key={h}
                  onClick={() => commit(h, minutes)}
                  className={`duration-wheel-row ${h === hours ? 'is-active' : ''}`}
                >
                  {String(h).padStart(2, '0')}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="duration-separator" aria-hidden="true">:</div>

        <div className="duration-wheel-col">
          <div className="duration-wheel-head">
            <span>Minutes</span>
            <div className="duration-stepper">
              <button type="button" className="duration-step" onClick={() => commit(hours, minutes - 5)} aria-label="Decrease minutes"><Minus size={14} /></button>
              <button type="button" className="duration-step" onClick={() => commit(hours, minutes + 5)} aria-label="Increase minutes"><Plus size={14} /></button>
            </div>
          </div>
          <div className="duration-wheel-frame">
            <div className="duration-wheel-highlight" aria-hidden="true" />
            <div
              ref={minutesRef}
              onScroll={handleMinutesScroll}
              className="duration-wheel scrollbar-none"
              tabIndex={0}
              aria-label="Minutes"
            >
              {minutesList.map(m => (
                <button
                  type="button"
                  key={m}
                  onClick={() => commit(hours, m)}
                  className={`duration-wheel-row ${m === minutes ? 'is-active' : ''}`}
                >
                  {String(m).padStart(2, '0')}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
