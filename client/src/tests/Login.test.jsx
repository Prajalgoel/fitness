import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../pages/Login';

describe('Login Component', () => {
  it('renders login form with email and password fields', () => {
    render(
      <BrowserRouter>
        <Login onLogin={() => {}} />
      </BrowserRouter>
    );

    // Check if login heading is present
    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();

    // Check if email and password inputs are present
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();

    // Check if submit button is present
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();

    // Check if signup link is present
    expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
  });
});
