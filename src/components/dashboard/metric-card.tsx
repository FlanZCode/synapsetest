import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type MetricCardProps = {
    title: string;
    icon: React.ReactNode;
    value: string;
    unit: string;
    className?: string;
    children?: React.ReactNode;
};

export function MetricCard({ title, icon, value, unit, className, children }: MetricCardProps) {
    return (
        <Card className={cn("bg-card/50 border-primary/10 hover:border-primary/30 transition-colors duration-300 flex flex-col", className)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground font-headline">{title}</CardTitle>
                <div className="text-accent">{icon}</div>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-center">
                {children ? (
                    children
                ) : (
                    <div className="text-4xl font-bold font-code text-primary-foreground drop-shadow-[0_0_8px_hsl(var(--primary))]">
                        {value}
                        <span className="text-lg font-headline text-muted-foreground ml-2">{unit}</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
