import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from '../components/ui/Badge';
import { Card, CardHeader } from '../components/ui/Card';
import { Spinner } from '../components/ui/Spinner';
import { Input } from '../components/ui/Input';

describe('Badge', () => {
  it('renders children', () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('applies success variant', () => {
    render(<Badge variant="success">OK</Badge>);
    expect(screen.getByText('OK').className).toContain('green');
  });

  it('applies danger variant', () => {
    render(<Badge variant="danger">Error</Badge>);
    expect(screen.getByText('Error').className).toContain('red');
  });
});

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Hello card</Card>);
    expect(screen.getByText('Hello card')).toBeInTheDocument();
  });
});

describe('CardHeader', () => {
  it('renders title and subtitle', () => {
    render(<CardHeader title="My Title" subtitle="A subtitle" />);
    expect(screen.getByText('My Title')).toBeInTheDocument();
    expect(screen.getByText('A subtitle')).toBeInTheDocument();
  });
});

describe('Spinner', () => {
  it('has a status role', () => {
    render(<Spinner />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('uses custom label', () => {
    render(<Spinner label="Processing" />);
    expect(screen.getByLabelText('Processing')).toBeInTheDocument();
  });
});

describe('Input', () => {
  it('renders with label', () => {
    render(<Input label="Email" />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('shows error message', () => {
    render(<Input label="Field" error="Required" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Required');
  });

  it('applies error border class', () => {
    render(<Input label="Field" error="Oops" />);
    const input = screen.getByLabelText('Field');
    expect(input.className).toContain('border-red');
  });
});
