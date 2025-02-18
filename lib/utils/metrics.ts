import { EventEmitter } from 'events';
import { logger } from './logger';

export interface MetricValue {
  value: number;
  timestamp: number;
  labels?: Record<string, string>;
}

export interface MetricConfig {
  name: string;
  help: string;
  type: 'counter' | 'gauge' | 'histogram';
  labels?: string[];
}

class Metric {
  private values: MetricValue[] = [];
  private config: MetricConfig;

  constructor(config: MetricConfig) {
    this.config = config;
  }

  record(value: number, labels?: Record<string, string>) {
    this.values.push({
      value,
      timestamp: Date.now(),
      labels,
    });

    // Keep only last 1000 values
    if (this.values.length > 1000) {
      this.values = this.values.slice(-1000);
    }
  }

  get(): MetricValue[] {
    return this.values;
  }

  getLast(): MetricValue | undefined {
    return this.values[this.values.length - 1];
  }

  clear() {
    this.values = [];
  }
}

class Metrics extends EventEmitter {
  private static instance: Metrics;
  private metrics: Map<string, Metric> = new Map();
  private exportInterval: NodeJS.Timer | null = null;

  private constructor() {
    super();
    this.setupExport();
  }

  public static getInstance(): Metrics {
    if (!Metrics.instance) {
      Metrics.instance = new Metrics();
    }
    return Metrics.instance;
  }

  register(config: MetricConfig): Metric {
    if (this.metrics.has(config.name)) {
      return this.metrics.get(config.name)!;
    }

    const metric = new Metric(config);
    this.metrics.set(config.name, metric);
    return metric;
  }

  record(name: string, value: number, labels?: Record<string, string>) {
    const metric = this.metrics.get(name);
    if (!metric) {
      logger.warn(`Metric ${name} not registered`);
      return;
    }

    metric.record(value, labels);
    this.emit('record', { name, value, labels });
  }

  get(name: string): MetricValue[] {
    const metric = this.metrics.get(name);
    if (!metric) {
      logger.warn(`Metric ${name} not registered`);
      return [];
    }

    return metric.get();
  }

  getAll(): Record<string, MetricValue[]> {
    const result: Record<string, MetricValue[]> = {};
    for (const [name, metric] of this.metrics.entries()) {
      result[name] = metric.get();
    }
    return result;
  }

  private setupExport() {
    // Export metrics every minute
    this.exportInterval = setInterval(() => {
      try {
        const metrics = this.getAll();
        this.emit('export', metrics);

        // Log metrics summary
        for (const [name, values] of Object.entries(metrics)) {
          const last = values[values.length - 1];
          if (last) {
            logger.info(`Metric ${name}: ${last.value}`, {
              metric: name,
              value: last.value,
              labels: last.labels,
            });
          }
        }
      } catch (error) {
        logger.error('Error exporting metrics:', error);
      }
    }, 60000);
  }

  async disconnect() {
    if (this.exportInterval) {
      clearInterval(this.exportInterval);
      this.exportInterval = null;
    }
  }
}

export const metrics = Metrics.getInstance(); 