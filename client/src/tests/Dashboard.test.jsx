import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import { summaryAPI } from '../services/api';

// Mock the API
vi.mock('../services/api', () => ({
  summaryAPI: {
    getToday: vi.fn(),
  },
}));

describe('Dashboard Component', () => {
  it('renders dashboard with mocked API response', async () => {
    // Mock API response
    const mockSummary = {
      consumed: 1500,
      burned: 550,
      net: 950,
      goal: 'loss',
      foodCount: 4,
      workoutCount: 2,
      advice: ['Great job! You have a calorie deficit today.'],
    };

    summaryAPI.getToday.mockResolvedValueOnce({ data: mockSummary });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText("Today's Summary")).toBeInTheDocument();
    });

    // Check if summary data is displayed
    await waitFor(() => {
      expect(screen.getByText('1500')).toBeInTheDocument();
      expect(screen.getByText('550')).toBeInTheDocument();
      expect(screen.getByText('+950')).toBeInTheDocument();
    });
  });

  it('displays loading state initially', () => {
    summaryAPI.getToday.mockImplementation(() => new Promise(() => {}));

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    expect(screen.getByText(/loading dashboard/i)).toBeInTheDocument();
  });
});
