"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  ShieldX,
  Timer,
  Waves,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MetricCard } from "./metric-card";
import { VortexGauge } from "./vortex-gauge";
import { SimpleGauge } from "./simple-gauge";
import { DataChart } from "./data-chart";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

type SpeedData = {
  ping: number;
  jitter: number;
  down: number;
  up: number;
  loss: number;
  vortex: number;
};

type HistoryPoint = SpeedData & { time: number };

const initialData: SpeedData = {
  ping: 0,
  jitter: 0,
  down: 0,
  up: 0,
  loss: 0,
  vortex: 0,
};

const TEST_DURATIONS = [5, 15, 30, 60];

export function SpeedTestDashboard() {
  const [isTesting, setIsTesting] = useState(false);
  const [data, setData] = useState<SpeedData>(initialData);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [duration, setDuration] = useState(TEST_DURATIONS[1]);
  const [averages, setAverages] = useState<SpeedData | null>(null);

  const { toast } = useToast();
  const socketRef = useRef<WebSocket | null>(null);
  const historyRef = useRef(history);
  historyRef.current = history;

  const calculateAverages = useCallback(() => {
    const finalHistory = historyRef.current;
    if (finalHistory.length > 0) {
      const totals = finalHistory.reduce(
        (acc, point) => {
          acc.ping += point.ping;
          acc.jitter += point.jitter;
          acc.down += point.down;
          acc.up += point.up;
          acc.loss += point.loss;
          acc.vortex += point.vortex;
          return acc;
        },
        { ping: 0, jitter: 0, down: 0, up: 0, loss: 0, vortex: 0 }
      );

      const count = finalHistory.length;
      setAverages({
        ping: totals.ping / count,
        jitter: totals.jitter / count,
        down: totals.down / count,
        up: totals.up / count,
        loss: totals.loss / count,
        vortex: totals.vortex / count,
      });
    }
  }, []);

  const stopTest = useCallback(() => {
    if (socketRef.current) {
      if (socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ type: "stop" }));
      }
      socketRef.current.close();
    }
  }, []);

  const startTest = useCallback(() => {
    setIsTesting(true);
    setData(initialData);
    setHistory([]);
    setAverages(null);

    const ws = new WebSocket("ws://127.0.0.1:9001");
    socketRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "start", duration }));
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === "data" && message.data) {
          const newData = message.data as SpeedData;
          setData(newData);
          setHistory((prevHistory) => {
            const newTime = prevHistory.length + 1;
            return [...prevHistory, { ...newData, time: newTime }];
          });
        } else if (message.type === "end") {
          stopTest();
        }
      } catch (error) {
        console.error("Error parsing message from WebSocket:", error);
      }
    };

    ws.onerror = () => {
      toast({
        variant: "destructive",
        title: "Connection Error",
        description:
          "Could not connect to the test server. Please ensure the Rust application is running.",
      });
      setIsTesting(false);
    };

    ws.onclose = () => {
      setIsTesting(false);
      calculateAverages();
      socketRef.current = null;
    };
  }, [duration, toast, calculateAverages, stopTest]);

  useEffect(() => {
    return () => {
      socketRef.current?.close();
    };
  }, []);

  const formatSpeed = (speed: number) => {
    if (speed < 100) return speed.toFixed(2);
    return speed.toFixed(1);
  };

  const displayData = !isTesting && averages ? averages : data;

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-center items-center gap-4 mb-8">
        <div className="flex items-center gap-2">
          <Label
            htmlFor="duration-select"
            className="font-headline text-muted-foreground"
          >
            Test Duration
          </Label>
          <Select
            value={String(duration)}
            onValueChange={(value) => setDuration(Number(value))}
            disabled={isTesting}
          >
            <SelectTrigger id="duration-select" className="w-[80px] font-code">
              <SelectValue placeholder="Time" />
            </SelectTrigger>
            <SelectContent>
              {TEST_DURATIONS.map((d) => (
                <SelectItem key={d} value={String(d)}>
                  {d}s
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          size="lg"
          onClick={isTesting ? stopTest : startTest}
          className="font-headline text-lg bg-primary hover:bg-primary/80 text-primary-foreground rounded-full px-12 py-6 shadow-[0_0_20px_hsl(var(--primary))] hover:shadow-[0_0_30px_hsl(var(--primary))] transition-all duration-300"
        >
          {isTesting ? "Stop Test" : "Start Test"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="md:col-span-2 lg:col-span-2 lg:row-span-2 rounded-lg bg-card/50 border-primary/10 p-6 flex items-center justify-center min-h-[300px] lg:min-h-0">
          <VortexGauge value={displayData.vortex} />
        </div>

        <Card className="md:col-span-2 lg:col-span-2 lg:row-span-2 bg-card/50 border-primary/10 hover:border-primary/30 transition-colors duration-300 p-2 sm:p-4">
          <CardContent className="p-2 sm:p-4">
            <DataChart data={history} />
          </CardContent>
        </Card>

        <MetricCard
          title={!isTesting && averages ? "Avg. Ping" : "Ping"}
          icon={<Timer className="w-6 h-6" />}
        >
          <SimpleGauge value={displayData.ping} max={100} unit="ms" />
        </MetricCard>

        <MetricCard
          title={!isTesting && averages ? "Avg. Jitter" : "Jitter"}
          icon={<Waves className="w-6 h-6" />}
        >
          <SimpleGauge value={displayData.jitter} max={20} unit="ms" />
        </MetricCard>

        <MetricCard
          title={!isTesting && averages ? "Avg. Download" : "Download"}
          icon={<ArrowDownCircle className="w-6 h-6" />}
          value={formatSpeed(displayData.down)}
          unit="Mbps"
        />

        <MetricCard
          title={!isTesting && averages ? "Avg. Upload" : "Upload"}
          icon={<ArrowUpCircle className="w-6 h-6" />}
          value={formatSpeed(displayData.up)}
          unit="Mbps"
        />

        <MetricCard
          title={!isTesting && averages ? "Avg. Packet Loss" : "Packet Loss"}
          icon={<ShieldX className="w-6 h-6" />}
          value={displayData.loss.toFixed(2)}
          unit="%"
        />
      </div>
    </div>
  );
}
