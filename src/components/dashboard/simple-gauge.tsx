"use client";

import type { SVGProps } from "react";

type SimpleGaugeProps = {
    value: number;
    max: number;
    unit: string;
    higherIsBetter?: boolean;
} & SVGProps<SVGSVGElement>;

export function SimpleGauge({ value, max, unit, higherIsBetter = false, ...props }: SimpleGaugeProps) {
    const SIZE = 100;
    const STROKE_WIDTH = 10;
    const RADIUS = (SIZE - STROKE_WIDTH) / 2;
    const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

    const progress = Math.min(value / max, 1);
    const offset = CIRCUMFERENCE * (1 - progress);

    const normalizedValue = Math.min(Math.max(value, 0), max) / max;
    const hue = higherIsBetter ? normalizedValue * 120 : (1 - normalizedValue) * 120;
    const color = `hsl(${hue}, 90%, 55%)`;

    return (
        <div className="relative flex items-center justify-center">
            <svg width="120" height="120" viewBox="0 0 120 120" {...props}>
                <circle
                    cx={60}
                    cy={60}
                    r={RADIUS}
                    fill="none"
                    stroke="hsl(var(--muted) / 0.5)"
                    strokeWidth={STROKE_WIDTH}
                />
                <circle
                    cx={60}
                    cy={60}
                    r={RADIUS}
                    fill="none"
                    stroke={color}
                    strokeWidth={STROKE_WIDTH}
                    strokeDasharray={CIRCUMFERENCE}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    transform="rotate(-90 60 60)"
                    className="transition-all duration-500"
                />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
            <span className="text-3xl font-bold font-code" style={{ color, textShadow: `0 0 8px ${color}` }}>
            {value.toFixed(0)}
            </span>
                <span className="text-xs text-muted-foreground">{unit}</span>
            </div>
        </div>
    );
}
