import { render, screen } from '@testing-library/react';
import Home from './page';

describe('Home', () => {
  it('renders hero heading and link to events', () => {
    render(<Home />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /browse events/i })).toHaveAttribute('href', '/events');
  });

  it('renders sign in and register links', () => {
    render(<Home />);
    expect(screen.getByRole('link', { name: /sign in/i })).toHaveAttribute('href', '/login');
    expect(screen.getByRole('link', { name: /register/i })).toBeInTheDocument();
  });
});
