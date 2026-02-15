import { VortexIcon } from "@/components/icons/vortex";

export function Header() {
    return (
        <header className="p-4 border-b border-primary/10 sticky top-0 bg-background/80 backdrop-blur-sm z-50">
            <div className="container mx-auto flex items-center gap-3">
                <VortexIcon className="w-8 h-8 text-primary animate-spin-slow" />
                <h1 className="text-2xl font-headline font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                    Vortex Stream
                </h1>
            </div>
        </header>
    );
}
