"use client";

import { cn } from "@/lib/utils";
import type { SVGProps } from "react";

type VortexGaugeProps = {
    value: number;
} & SVGProps<SVGSVGElement>;

export function VortexGauge({ value, ...props }: VortexGaugeProps) {
    const SIZE = 300;
    const STROKE_WIDTH = 18;
    const RADIUS = (SIZE - STROKE_WIDTH) / 2;
    const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

    const progress = value / 500;
    const offset = CIRCUMFERENCE * (1 - progress);

    const normalizedValue = Math.min(Math.max(value, 0), 500) / 500;
    // Higher is better for Vortex score
    const hue = normalizedValue * 120;
    const color = `hsl(${hue}, 90%, 55%)`;

    return (
        <div className="relative w-full max-w-[400px] aspect-square flex items-center justify-center">
            <svg
                viewBox={`0 0 ${SIZE} ${SIZE}`}
                className={cn("w-full h-full", props.className)}
                style={{ filter: `drop-shadow(0 0 15px ${color})`}}
                {...props}
            >
                {/* Background track */}
                <circle
                    cx={SIZE / 2}
                    cy={SIZE / 2}
                    r={RADIUS}
                    fill="none"
                    stroke="hsl(var(--primary) / 0.1)"
                    strokeWidth={STROKE_WIDTH}
                />

                {/* Inner decorative rings */}
                <circle cx={SIZE/2} cy={SIZE/2} r={RADIUS - 30} stroke="hsl(var(--primary)/0.1)" strokeWidth="1" fill="none" />
                <circle cx={SIZE/2} cy={SIZE/2} r={RADIUS - 60} stroke="hsl(var(--primary)/0.05)" strokeWidth="1" fill="none" />

                {/* Progress bar */}
                <circle
                    cx={SIZE / 2}
                    cy={SIZE / 2}
                    r={RADIUS}
                    fill="none"
                    stroke={color}
                    strokeWidth={STROKE_WIDTH}
                    strokeDasharray={CIRCUMFERENCE}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
                    className="transition-all duration-500 ease-in-out"
                />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
                <span className="font-headline text-lg text-accent -mb-2">Vortex</span>
                <span className="font-code font-bold text-7xl md:text-8xl" style={{ color, textShadow: `0 0 12px ${color}` }}>
          {Math.round(value)}
        </span>
            </div>
        </div>
    );
}
