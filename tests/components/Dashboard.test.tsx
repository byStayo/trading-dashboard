import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Dashboard from '../../components/Dashboard';
import { dashboardService } from '../../lib/services/dashboard-service';
import type { WidgetConfig } from '../../lib/types/market-data';

// Mock dashboard service
jest.mock('../../lib/services/dashboard-service', () => ({
  dashboardService: {
    initialize: jest.fn(),
    addWidget: jest.fn(),
    removeWidget: jest.fn(),
    updateWidget: jest.fn(),
    getAllWidgets: jest.fn(),
    setTheme: jest.fn(),
    setLayout: jest.fn(),
    on: jest.fn(),
    removeListener: jest.fn(),
  },
}));

describe('Dashboard Component', () => {
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

  beforeEach(() => {
    jest.clearAllMocks();
    (dashboardService.getAllWidgets as jest.Mock).mockReturnValue([]);
  });

  it('should render without crashing', () => {
    render(<Dashboard />);
    expect(screen.getByText('Trading Dashboard')).toBeInTheDocument();
  });

  it('should initialize dashboard service with props', () => {
    render(
      <Dashboard
        defaultLayout="flex"
        defaultTheme="dark"
        refreshInterval={2000}
      />
    );

    expect(dashboardService.initialize).toHaveBeenCalledWith({
      layout: 'flex',
      theme: 'dark',
      refreshInterval: 2000,
    });
  });

  it('should render widgets', () => {
    (dashboardService.getAllWidgets as jest.Mock).mockReturnValue([mockWidget]);
    render(<Dashboard />);

    expect(screen.getByText('AAPL')).toBeInTheDocument();
  });

  it('should handle theme toggle', () => {
    render(<Dashboard defaultTheme="light" />);
    
    const toggleButton = screen.getByText('Toggle Dark Mode');
    fireEvent.click(toggleButton);

    expect(dashboardService.setTheme).toHaveBeenCalledWith('dark');
  });

  it('should handle layout change', () => {
    render(<Dashboard defaultLayout="grid" />);
    
    const layoutSelect = screen.getByRole('combobox');
    fireEvent.change(layoutSelect, { target: { value: 'flex' } });

    expect(dashboardService.setLayout).toHaveBeenCalledWith('flex');
  });

  it('should handle widget addition', async () => {
    render(<Dashboard />);
    
    const addButton = screen.getByText('Add Chart Widget');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(dashboardService.addWidget).toHaveBeenCalled();
    });
  });

  it('should handle widget removal', async () => {
    (dashboardService.getAllWidgets as jest.Mock).mockReturnValue([mockWidget]);
    render(<Dashboard />);
    
    const removeButton = screen.getByText('Remove');
    fireEvent.click(removeButton);

    await waitFor(() => {
      expect(dashboardService.removeWidget).toHaveBeenCalledWith(mockWidget.id);
    });
  });

  it('should handle widget expansion', async () => {
    (dashboardService.getAllWidgets as jest.Mock).mockReturnValue([mockWidget]);
    render(<Dashboard />);
    
    const expandButton = screen.getByText('Expand');
    fireEvent.click(expandButton);

    await waitFor(() => {
      expect(dashboardService.updateWidget).toHaveBeenCalledWith(
        mockWidget.id,
        expect.objectContaining({
          position: expect.objectContaining({
            width: mockWidget.position.width + 1,
          }),
        })
      );
    });
  });

  it('should handle widget data updates', () => {
    (dashboardService.getAllWidgets as jest.Mock).mockReturnValue([mockWidget]);
    render(<Dashboard />);

    // Simulate widget data update
    const handlers: Record<string, Function> = {};
    (dashboardService.on as jest.Mock).mockImplementation((event, handler) => {
      handlers[event] = handler;
    });

    const mockData = {
      data: [{ timestamp: Date.now(), value: 150 }],
      config: mockWidget.settings.chartConfig,
      metadata: {
        symbol: 'AAPL',
        lastUpdated: Date.now(),
        dataPoints: 1,
      },
    };

    handlers['widgetData']({ widgetId: mockWidget.id, data: mockData });

    expect(screen.getByText(JSON.stringify(mockData, null, 2))).toBeInTheDocument();
  });

  it('should clean up event listeners on unmount', () => {
    const { unmount } = render(<Dashboard />);
    unmount();

    expect(dashboardService.removeListener).toHaveBeenCalled();
  });

  it('should handle errors gracefully', async () => {
    (dashboardService.addWidget as jest.Mock).mockRejectedValue(new Error('Test error'));
    render(<Dashboard />);

    const addButton = screen.getByText('Add Chart Widget');
    fireEvent.click(addButton);

    // Verify error is handled (no crash)
    await waitFor(() => {
      expect(dashboardService.addWidget).toHaveBeenCalled();
    });
  });
}); 