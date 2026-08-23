export type TickListener = () => void;

class PollerService {
    private static instance: PollerService;

    private intervalId: ReturnType<typeof setInterval> | null = null;
    private currentInterval: number = 5000;
    private isRunning: boolean = false;

    private listeners: Set<TickListener> = new Set();

    private constructor() {}

    public static getInstance(): PollerService {
        if (!PollerService.instance) {
            PollerService.instance = new PollerService();
        }
        return PollerService.instance;
    }

    public start(intervalMs?: number): void {
        if (intervalMs) {
            this.currentInterval = intervalMs;
        }
        this.isRunning = true;
        this.restartInterval();
    }

    public stop(): void {
        this.isRunning = false;
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    public updateInterval(intervalMs: number): void {
        this.currentInterval = intervalMs;
        if (this.isRunning) {
            this.restartInterval();
        }
    }

    private restartInterval(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
        
        this.intervalId = setInterval(() => {
            this.listeners.forEach(listener => listener());
        }, this.currentInterval);
    }

    public subscribe(listener: TickListener): () => void {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    }
}

export default PollerService;
