import { dashboardService } from '../../lib/services/dashboard-service';
import type { WidgetConfig, MarketData } from '../../lib/types/market-data';

describe('DashboardService', () => {
  const mockWidget: WidgetConfig = {
    id: 'test-widget-1',
    type: 'chart',
    position: {
      x: 0,
      y: 0,
      width: 2,
      height: 2,
    },
    settings: {
      symbol: 'AAPL',
      chartConfig: {
        type: 'line',
        timeframe: '1m',
      },
    },
  };

  const mockMarketData: MarketData = {
    symbol: 'AAPL',
    price: 150.0,
    change: 2.5,
    changePercent: 1.67,
    volume: 1000000,
    lastUpdated: Date.now(),
    metadata: {
      source: 'websocket',
      reliability: 1,
      staleness: 0,
    },
  };

  beforeEach(async () => {
    // Reset dashboard state
    await dashboardService.initialize({
      layout: 'grid',
      theme: 'light',
      refreshInterval: 1000,
      maxWidgets: 12,
    });
  });

  describe('initialization', () => {
    it('should initialize with default config', async () => {
      const state = dashboardService.getDashboardState();
      expect(state.layout).toBe('grid');
      expect(state.theme).toBe('light');
      expect(state.widgets.size).toBe(0);
      expect(state.activeSymbols.size).toBe(0);
    });

    it('should handle custom config', async () => {
      await dashboardService.initialize({
        layout: 'flex',
        theme: 'dark',
        refreshInterval: 2000,
        maxWidgets: 6,
      });

      const state = dashboardService.getDashboardState();
      expect(state.layout).toBe('flex');
      expect(state.theme).toBe('dark');
    });
  });

  describe('widget management', () => {
    it('should add widget correctly', async () => {
      await dashboardService.addWidget(mockWidget);
      const widgets = dashboardService.getAllWidgets();
      
      expect(widgets).toHaveLength(1);
      expect(widgets[0]).toEqual(mockWidget);
    });

    it('should enforce maximum widget limit', async () => {
      const maxWidgets = 2;
      await dashboardService.initialize({ maxWidgets });

      // Add widgets up to limit
      await dashboardService.addWidget({ ...mockWidget, id: 'widget-1' });
      await dashboardService.addWidget({ ...mockWidget, id: 'widget-2' });

      // Try to add one more
      await expect(
        dashboardService.addWidget({ ...mockWidget, id: 'widget-3' })
      ).rejects.toThrow('Maximum number of widgets reached');
    });

    it('should remove widget correctly', async () => {
      await dashboardService.addWidget(mockWidget);
      await dashboardService.removeWidget(mockWidget.id);
      
      const widgets = dashboardService.getAllWidgets();
      expect(widgets).toHaveLength(0);
    });

    it('should update widget correctly', async () => {
      await dashboardService.addWidget(mockWidget);
      
      const updates: Partial<WidgetConfig> = {
        position: {
          ...mockWidget.position,
          width: 3,
        },
      };

      await dashboardService.updateWidget(mockWidget.id, updates);
      const widget = dashboardService.getWidgetConfig(mockWidget.id);
      
      expect(widget?.position.width).toBe(3);
    });
  });

  describe('theme management', () => {
    it('should change theme correctly', () => {
      dashboardService.setTheme('dark');
      const state = dashboardService.getDashboardState();
      expect(state.theme).toBe('dark');
    });
  });

  describe('layout management', () => {
    it('should change layout correctly', () => {
      dashboardService.setLayout('flex');
      const state = dashboardService.getDashboardState();
      expect(state.layout).toBe('flex');
    });
  });

  describe('event handling', () => {
    it('should emit events on widget changes', async () => {
      const widgetAddedHandler = jest.fn();
      const widgetRemovedHandler = jest.fn();
      const widgetUpdatedHandler = jest.fn();

      dashboardService.on('widgetAdded', widgetAddedHandler);
      dashboardService.on('widgetRemoved', widgetRemovedHandler);
      dashboardService.on('widgetUpdated', widgetUpdatedHandler);

      // Test add
      await dashboardService.addWidget(mockWidget);
      expect(widgetAddedHandler).toHaveBeenCalledWith(mockWidget);

      // Test update
      const updates: Partial<WidgetConfig> = {
        position: { ...mockWidget.position, width: 3 },
      };
      await dashboardService.updateWidget(mockWidget.id, updates);
      expect(widgetUpdatedHandler).toHaveBeenCalled();

      // Test remove
      await dashboardService.removeWidget(mockWidget.id);
      expect(widgetRemovedHandler).toHaveBeenCalledWith(mockWidget.id);
    });

    it('should emit events on theme and layout changes', () => {
      const themeChangedHandler = jest.fn();
      const layoutChangedHandler = jest.fn();

      dashboardService.on('themeChanged', themeChangedHandler);
      dashboardService.on('layoutChanged', layoutChangedHandler);

      dashboardService.setTheme('dark');
      expect(themeChangedHandler).toHaveBeenCalledWith('dark');

      dashboardService.setLayout('flex');
      expect(layoutChangedHandler).toHaveBeenCalledWith('flex');
    });
  });
}); 