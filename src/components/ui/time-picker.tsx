import { useEffect, useRef, useState, useMemo } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';
const ITEM_HEIGHT = 40;
const VISIBLE_ITEMS = 3;
const CONTAINER_HEIGHT = VISIBLE_ITEMS * ITEM_HEIGHT;
const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
interface WheelProps {
  items: string[];
  value: string;
  onSelect: (value: string) => void;
}
function Wheel({ items, value, onSelect }: WheelProps) {
  const y = useMotionValue(0);
  const springY = useSpring(y, { damping: 30, stiffness: 200 });
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedIndex = useMemo(() => items.indexOf(value), [items, value]);
  useEffect(() => {
    if (selectedIndex !== -1) {
      const targetY = -selectedIndex * ITEM_HEIGHT;
      y.set(targetY);
    }
  }, [selectedIndex, y]);
  const handleDragEnd = () => {
    const currentY = y.get();
    const closestIndex = Math.round(-currentY / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(items.length - 1, closestIndex));
    onSelect(items[clampedIndex]);
    y.set(-clampedIndex * ITEM_HEIGHT);
  };
  const handleWheel = (event: React.WheelEvent) => {
    event.preventDefault();
    const newY = y.get() - event.deltaY;
    const maxPositiveY = 0;
    const maxNegativeY = -(items.length - 1) * ITEM_HEIGHT;
    const clampedY = Math.max(maxNegativeY, Math.min(maxPositiveY, newY));
    y.set(clampedY);
    handleDragEnd();
  };
  return (
    <div
      ref={containerRef}
      className="h-full w-1/2 overflow-hidden"
      onWheel={handleWheel}
    >
      <motion.div
        drag="y"
        dragConstraints={{
          top: -(items.length - 1) * ITEM_HEIGHT,
          bottom: 0,
        }}
        onDragEnd={handleDragEnd}
        style={{ y: springY }}
        className="flex flex-col items-center cursor-grab active:cursor-grabbing"
      >
        {items.map((item, index) => {
          const dist = useTransform(springY, (v) => Math.abs(v + index * ITEM_HEIGHT) / ITEM_HEIGHT);
          const opacity = useTransform(dist, [0, 1, 2], [1, 0.5, 0]);
          const scale = useTransform(dist, [0, 1, 2], [1, 0.8, 0.6]);
          return (
            <motion.div
              key={item}
              className="flex h-10 w-full items-center justify-center text-2xl font-semibold"
              style={{ opacity, scale }}
            >
              {item}
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
interface TimePickerProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}
export function TimePicker({ value, onChange, className }: TimePickerProps) {
  const [hour, minute] = useMemo(() => {
    const [h, m] = value.split(':');
    return [h?.padStart(2, '0') || '00', m?.padStart(2, '0') || '00'];
  }, [value]);
  const handleHourChange = (newHour: string) => {
    onChange(`${newHour}:${minute}`);
  };
  const handleMinuteChange = (newMinute: string) => {
    onChange(`${hour}:${newMinute}`);
  };
  return (
    <div className={cn("relative flex h-[120px] w-full items-center justify-center rounded-md border bg-muted/50", className)}>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-10 w-[calc(100%-1rem)] rounded-md bg-violet-600/10 border border-violet-600/20" />
      </div>
      <div className="relative z-10 flex h-full w-full items-center">
        <Wheel items={hours} value={hour} onSelect={handleHourChange} />
        <div className="flex h-full items-center text-2xl font-semibold text-muted-foreground">:</div>
        <Wheel items={minutes} value={minute} onSelect={handleMinuteChange} />
      </div>
    </div>
  );
}