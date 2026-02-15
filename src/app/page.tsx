import { Header } from "@/components/dashboard/header";
import { SpeedTestDashboard } from "@/components/dashboard/speed-test-dashboard";

export default function Home() {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">
                <SpeedTestDashboard />
            </main>
        </div>
    );
}
