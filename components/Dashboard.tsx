import React, { useEffect, useState, useCallback } from 'react';
import { dashboardService } from '../lib/services/dashboard-service';
import type { WidgetConfig, ChartConfig } from '../lib/types/market-data';

interface DashboardProps {
  defaultLayout?: 'grid' | 'flex' | 'custom';
  defaultTheme?: 'light' | 'dark';
  refreshInterval?: number;
}

const Dashboard: React.FC<DashboardProps> = ({
  defaultLayout = 'grid',
  defaultTheme = 'light',
  refreshInterval = 5000,
}) => {
  const [widgets, setWidgets] = useState<WidgetConfig[]>([]);
  const [layout, setLayout] = useState(defaultLayout);
  const [theme, setTheme] = useState(defaultTheme);
  const [widgetData, setWidgetData] = useState<Record<string, any>>({});

  useEffect(() => {
    // Initialize dashboard
    dashboardService.initialize({
      layout: defaultLayout,
      theme: defaultTheme,
      refreshInterval,
    });

    // Set up event listeners
    const handleWidgetData = ({ widgetId, data }: { widgetId: string; data: any }) => {
      setWidgetData(prev => ({ ...prev, [widgetId]: data }));
    };

    const handleWidgetAdded = (widget: WidgetConfig) => {
      setWidgets(prev => [...prev, widget]);
    };

    const handleWidgetRemoved = (widgetId: string) => {
      setWidgets(prev => prev.filter(w => w.id !== widgetId));
      setWidgetData(prev => {
        const { [widgetId]: removed, ...rest } = prev;
        return rest;
      });
    };

    const handleWidgetUpdated = (widget: WidgetConfig) => {
      setWidgets(prev => prev.map(w => w.id === widget.id ? widget : w));
    };

    const handleThemeChanged = (newTheme: 'light' | 'dark') => {
      setTheme(newTheme);
    };

    const handleLayoutChanged = (newLayout: 'grid' | 'flex' | 'custom') => {
      setLayout(newLayout);
    };

    dashboardService.on('widgetData', handleWidgetData);
    dashboardService.on('widgetAdded', handleWidgetAdded);
    dashboardService.on('widgetRemoved', handleWidgetRemoved);
    dashboardService.on('widgetUpdated', handleWidgetUpdated);
    dashboardService.on('themeChanged', handleThemeChanged);
    dashboardService.on('layoutChanged', handleLayoutChanged);

    // Load initial widgets
    setWidgets(dashboardService.getAllWidgets());

    return () => {
      // Clean up event listeners
      dashboardService.removeListener('widgetData', handleWidgetData);
      dashboardService.removeListener('widgetAdded', handleWidgetAdded);
      dashboardService.removeListener('widgetRemoved', handleWidgetRemoved);
      dashboardService.removeListener('widgetUpdated', handleWidgetUpdated);
      dashboardService.removeListener('themeChanged', handleThemeChanged);
      dashboardService.removeListener('layoutChanged', handleLayoutChanged);
    };
  }, [defaultLayout, defaultTheme, refreshInterval]);

  const handleAddWidget = useCallback(async (config: WidgetConfig) => {
    try {
      await dashboardService.addWidget(config);
    } catch (error) {
      console.error('Error adding widget:', error);
    }
  }, []);

  const handleRemoveWidget = useCallback(async (widgetId: string) => {
    try {
      await dashboardService.removeWidget(widgetId);
    } catch (error) {
      console.error('Error removing widget:', error);
    }
  }, []);

  const handleUpdateWidget = useCallback(async (
    widgetId: string,
    updates: Partial<WidgetConfig>
  ) => {
    try {
      await dashboardService.updateWidget(widgetId, updates);
    } catch (error) {
      console.error('Error updating widget:', error);
    }
  }, []);

  const handleThemeToggle = useCallback(() => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    dashboardService.setTheme(newTheme);
  }, [theme]);

  const handleLayoutChange = useCallback((newLayout: 'grid' | 'flex' | 'custom') => {
    dashboardService.setLayout(newLayout);
  }, []);

  return (
    <div className={`dashboard ${theme} ${layout}`}>
      <div className="dashboard-header">
        <h1>Trading Dashboard</h1>
        <div className="dashboard-controls">
          <button onClick={handleThemeToggle}>
            Toggle {theme === 'light' ? 'Dark' : 'Light'} Mode
          </button>
          <select
            value={layout}
            onChange={(e) => handleLayoutChange(e.target.value as any)}
          >
            <option value="grid">Grid Layout</option>
            <option value="flex">Flex Layout</option>
            <option value="custom">Custom Layout</option>
          </select>
          <button onClick={() => handleAddWidget({
            id: `widget-${Date.now()}`,
            type: 'chart',
            position: { x: 0, y: 0, width: 2, height: 2 },
            settings: {
              symbol: 'AAPL',
              chartConfig: {
                type: 'line',
                timeframe: '1m',
              } as ChartConfig,
            },
          })}>
            Add Chart Widget
          </button>
        </div>
      </div>

      <div className={`dashboard-grid ${layout}`}>
        {widgets.map(widget => (
          <div
            key={widget.id}
            className={`widget ${widget.type}`}
            style={{
              gridColumn: `span ${widget.position.width}`,
              gridRow: `span ${widget.position.height}`,
            }}
          >
            <div className="widget-header">
              <h3>{widget.settings.symbol}</h3>
              <div className="widget-controls">
                <button onClick={() => handleUpdateWidget(widget.id, {
                  position: {
                    ...widget.position,
                    width: widget.position.width + 1,
                  },
                })}>
                  Expand
                </button>
                <button onClick={() => handleRemoveWidget(widget.id)}>
                  Remove
                </button>
              </div>
            </div>
            <div className="widget-content">
              {widgetData[widget.id] ? (
                <pre>{JSON.stringify(widgetData[widget.id], null, 2)}</pre>
              ) : (
                <div className="widget-loading">Loading...</div>
              )}
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .dashboard {
          padding: 20px;
          min-height: 100vh;
          background: ${theme === 'light' ? '#f5f5f5' : '#1a1a1a'};
          color: ${theme === 'light' ? '#000' : '#fff'};
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .dashboard-controls {
          display: flex;
          gap: 10px;
        }

        .dashboard-grid {
          display: grid;
          gap: 20px;
          padding: 20px;
        }

        .dashboard-grid.grid {
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        }

        .dashboard-grid.flex {
          display: flex;
          flex-wrap: wrap;
        }

        .widget {
          background: ${theme === 'light' ? '#fff' : '#2a2a2a'};
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          padding: 15px;
        }

        .widget-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .widget-controls {
          display: flex;
          gap: 5px;
        }

        .widget-content {
          min-height: 200px;
        }

        .widget-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 200px;
          color: #666;
        }

        button {
          padding: 8px 12px;
          border-radius: 4px;
          border: none;
          background: ${theme === 'light' ? '#007bff' : '#0056b3'};
          color: white;
          cursor: pointer;
        }

        button:hover {
          background: ${theme === 'light' ? '#0056b3' : '#003d80'};
        }

        select {
          padding: 8px;
          border-radius: 4px;
          border: 1px solid #ccc;
          background: ${theme === 'light' ? '#fff' : '#2a2a2a'};
          color: ${theme === 'light' ? '#000' : '#fff'};
        }
      `}</style>
    </div>
  );
};

export default Dashboard; 