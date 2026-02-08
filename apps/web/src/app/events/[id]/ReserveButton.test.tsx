import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { api } from '@/lib/api';
import { ReserveButton } from './ReserveButton';

const mockUseAuth = jest.fn();
jest.mock('@/context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));
jest.mock('@/lib/api', () => ({
  api: { reservations: { create: jest.fn() } },
}));

describe('ReserveButton', () => {
  const createMock = api.reservations.create as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows sign in link when not authenticated', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false, loading: false });
    render(<ReserveButton eventId="ev-1" placesLeft={5} />);
    expect(screen.getByRole('link', { name: /sign in to reserve/i })).toHaveAttribute(
      'href',
      '/login?redirect=/events/ev-1'
    );
  });

  it('shows full message when places left is 0', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true, loading: false });
    render(<ReserveButton eventId="ev-1" placesLeft={0} />);
    expect(screen.getByText(/this event is full/i)).toBeInTheDocument();
  });

  it('shows reserve button when authenticated and places available', async () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true, loading: false });
    createMock.mockResolvedValue({ id: 'res-1', status: 'PENDING' });
    render(<ReserveButton eventId="ev-1" placesLeft={5} />);
    const button = screen.getByRole('button', { name: /reserve a place/i });
    expect(button).toBeInTheDocument();
    await userEvent.click(button);
    await waitFor(() => {
      expect(createMock).toHaveBeenCalledWith('ev-1');
    });
    await waitFor(() => {
      expect(screen.getByText(/reservation requested/i)).toBeInTheDocument();
    });
  });

  it('shows error when reservation fails', async () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true, loading: false });
    createMock.mockRejectedValue(new Error('Event is full'));
    render(<ReserveButton eventId="ev-1" placesLeft={5} />);
    await userEvent.click(screen.getByRole('button', { name: /reserve a place/i }));
    await waitFor(() => {
      expect(screen.getByText(/event is full/i)).toBeInTheDocument();
    });
  });
});
