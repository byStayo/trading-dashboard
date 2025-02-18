import { EventEmitter } from 'events';
import { logger } from '../utils/logger';
import { metrics } from '../utils/metrics';
import { visualizationService } from './visualization-service';
import { analyticsService } from './analytics-service';
import { marketDataService } from './market-data-service';
import type { MarketData, ChartConfig } from '../types/market-data';

interface DashboardConfig {
  layout: 'grid' | 'flex' | 'custom';
  theme: 'light' | 'dark';
  refreshInterval: number;
  maxWidgets: number;
}

interface WidgetConfig {
  id: string;
  type: 'chart' | 'stats' | 'news' | 'alerts';
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  settings: any;
}

interface DashboardState {
  widgets: Map<string, WidgetConfig>;
  activeSymbols: Set<string>;
  layout: string;
  theme: string;
}

const DEFAULT_CONFIG: DashboardConfig = {
  layout: 'grid',
  theme: 'light',
  refreshInterval: 5000,
  maxWidgets: 12,
} as const;

class DashboardService extends EventEmitter {
  private static instance: DashboardService;
  private state: DashboardState;
  private updateInterval: NodeJS.Timeout | null = null;
  private widgetSubscriptions: Map<string, () => void> = new Map();
  private marketDataCache: Map<string, MarketData> = new Map();

  private constructor() {
    super();
    this.state = {
      widgets: new Map(),
      activeSymbols: new Set(),
      layout: DEFAULT_CONFIG.layout,
      theme: DEFAULT_CONFIG.theme,
    };
    this.setupMetrics();
  }

  public static getInstance(): DashboardService {
    if (!DashboardService.instance) {
      DashboardService.instance = new DashboardService();
    }
    return DashboardService.instance;
  }

  private setupMetrics() {
    metrics.register({
      name: 'dashboard_widgets',
      help: 'Number of active dashboard widgets',
      type: 'gauge',
      labels: ['type'],
    });

    metrics.register({
      name: 'dashboard_updates',
      help: 'Number of dashboard updates',
      type: 'counter',
      labels: ['type'],
    });

    metrics.register({
      name: 'dashboard_errors',
      help: 'Number of dashboard errors',
      type: 'counter',
      labels: ['type'],
    });
  }

  async initialize(config: Partial<DashboardConfig> = {}): Promise<void> {
    try {
      const fullConfig = { ...DEFAULT_CONFIG, ...config };
      this.state.layout = fullConfig.layout;
      this.state.theme = fullConfig.theme;

      // Set up auto-refresh
      if (this.updateInterval) {
        clearInterval(this.updateInterval);
      }
      this.updateInterval = setInterval(
        () => this.refreshDashboard(),
        fullConfig.refreshInterval
      );

      metrics.record('dashboard_updates', 1, { type: 'initialization' });
    } catch (error) {
      logger.error('Error initializing dashboard:', error);
      metrics.record('dashboard_errors', 1, { type: 'initialization' });
      throw error;
    }
  }

  async addWidget(config: WidgetConfig): Promise<void> {
    try {
      if (this.state.widgets.size >= DEFAULT_CONFIG.maxWidgets) {
        throw new Error('Maximum number of widgets reached');
      }

      this.state.widgets.set(config.id, config);
      await this.setupWidgetSubscriptions(config);

      metrics.record('dashboard_widgets', this.state.widgets.size, {
        type: config.type,
      });
      metrics.record('dashboard_updates', 1, { type: 'widget_add' });

      this.emit('widgetAdded', config);
    } catch (error) {
      logger.error('Error adding widget:', error);
      metrics.record('dashboard_errors', 1, { type: 'widget_add' });
      throw error;
    }
  }

  async removeWidget(widgetId: string): Promise<void> {
    try {
      const widget = this.state.widgets.get(widgetId);
      if (!widget) return;

      // Clean up subscriptions
      const unsubscribe = this.widgetSubscriptions.get(widgetId);
      if (unsubscribe) {
        unsubscribe();
        this.widgetSubscriptions.delete(widgetId);
      }

      this.state.widgets.delete(widgetId);

      metrics.record('dashboard_widgets', this.state.widgets.size, {
        type: widget.type,
      });
      metrics.record('dashboard_updates', 1, { type: 'widget_remove' });

      this.emit('widgetRemoved', widgetId);
    } catch (error) {
      logger.error('Error removing widget:', error);
      metrics.record('dashboard_errors', 1, { type: 'widget_remove' });
      throw error;
    }
  }

  async updateWidget(
    widgetId: string,
    updates: Partial<WidgetConfig>
  ): Promise<void> {
    try {
      const widget = this.state.widgets.get(widgetId);
      if (!widget) return;

      const updatedConfig = { ...widget, ...updates };
      this.state.widgets.set(widgetId, updatedConfig);

      // Update subscriptions if necessary
      if (updates.settings?.symbol !== widget.settings?.symbol) {
        await this.setupWidgetSubscriptions(updatedConfig);
      }

      metrics.record('dashboard_updates', 1, { type: 'widget_update' });
      this.emit('widgetUpdated', updatedConfig);
    } catch (error) {
      logger.error('Error updating widget:', error);
      metrics.record('dashboard_errors', 1, { type: 'widget_update' });
      throw error;
    }
  }

  private async setupWidgetSubscriptions(widget: WidgetConfig): Promise<void> {
    // Clean up existing subscription
    const unsubscribe = this.widgetSubscriptions.get(widget.id);
    if (unsubscribe) {
      unsubscribe();
    }

    if (widget.type === 'chart' && widget.settings?.symbol) {
      const symbol = widget.settings.symbol;
      this.state.activeSymbols.add(symbol);

      const callback = async (data: MarketData) => {
        try {
          // Cache the market data
          this.marketDataCache.set(symbol, data);

          const chartData = await visualizationService.prepareChartData(
            [data],
            widget.settings.chartConfig as ChartConfig
          );
          this.emit('widgetData', { widgetId: widget.id, data: chartData });
        } catch (error) {
          logger.error(`Error updating chart widget ${widget.id}:`, error);
        }
      };

      await marketDataService.subscribe(symbol, callback);
      this.widgetSubscriptions.set(widget.id, () => {
        marketDataService.unsubscribe(symbol, callback);
        this.state.activeSymbols.delete(symbol);
        this.marketDataCache.delete(symbol);
      });
    }
  }

  private async refreshDashboard(): Promise<void> {
    try {
      const updates = await Promise.all(
        Array.from(this.state.widgets.values()).map(async widget => {
          if (widget.type === 'stats' && widget.settings?.symbol) {
            const data = await this.fetchWidgetStatistics(widget);
            return { widgetId: widget.id, data };
          }
          return null;
        })
      );

      updates.filter(Boolean).forEach(update => {
        if (update) {
          this.emit('widgetData', update);
        }
      });

      metrics.record('dashboard_updates', 1, { type: 'refresh' });
    } catch (error) {
      logger.error('Error refreshing dashboard:', error);
      metrics.record('dashboard_errors', 1, { type: 'refresh' });
    }
  }

  private async fetchWidgetStatistics(widget: WidgetConfig): Promise<any> {
    const symbol = widget.settings.symbol;
    const marketData = this.marketDataCache.get(symbol);
    
    if (!marketData) return null;

    switch (widget.settings.statsType) {
      case 'volatility':
        return analyticsService.calculateVolatility([marketData], {
          period: widget.settings.period || 14,
        });
      
      case 'momentum':
        return analyticsService.calculateMomentum([marketData], {
          period: widget.settings.period || 14,
          smoothing: widget.settings.smoothing || 0.2,
        });
      
      case 'statistics':
        return analyticsService.calculateStatistics([marketData]);
      
      default:
        return null;
    }
  }

  getWidgetConfig(widgetId: string): WidgetConfig | undefined {
    return this.state.widgets.get(widgetId);
  }

  getAllWidgets(): WidgetConfig[] {
    return Array.from(this.state.widgets.values());
  }

  getActiveSymbols(): string[] {
    return Array.from(this.state.activeSymbols);
  }

  getDashboardState(): DashboardState {
    return { ...this.state };
  }

  setTheme(theme: DashboardConfig['theme']): void {
    this.state.theme = theme;
    this.emit('themeChanged', theme);
  }

  setLayout(layout: DashboardConfig['layout']): void {
    this.state.layout = layout;
    this.emit('layoutChanged', layout);
  }
}

export const dashboardService = DashboardService.getInstance(); 