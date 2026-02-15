import type { SVGProps } from "react";

export function VortexIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <path d="M4.64,4.64a8.94,8.94,0,0,0,0,12.72" />
            <path d="M19.36,19.36a8.94,8.94,0,0,0,0-12.72" />
            <path d="M2.22,9.31a10.6,10.6,0,0,1,0,5.38" />
            <path d="M21.78,14.69a10.6,10.6,0,0,1,0-5.38" />
            <path d="M6.8,2.52a10.51,10.51,0,0,1,10.4,0" />
            <path d="M17.2,21.48a10.51,10.51,0,0,1-10.4,0" />
        </svg>
    );
}
