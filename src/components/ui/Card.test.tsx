import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardBody, CardFooter } from './Card';

describe('Card', () => {
  it('renders children', () => {
    render(
      <Card>
        <p>Card content</p>
      </Card>
    );
    
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <Card className="custom-class">
        <p>Content</p>
      </Card>
    );
    
    const card = screen.getByText('Content').parentElement;
    expect(card).toHaveClass('custom-class');
  });

  it('has default styling', () => {
    render(
      <Card>
        <p>Content</p>
      </Card>
    );
    
    const card = screen.getByText('Content').parentElement;
    expect(card).toHaveClass('bg-[#2c3e50]', 'rounded-[10px]', 'border-2');
  });
});

describe('CardHeader', () => {
  it('renders children', () => {
    render(
      <CardHeader>
        <h2>Header content</h2>
      </CardHeader>
    );
    
    expect(screen.getByText('Header content')).toBeInTheDocument();
  });

  it('has border bottom styling', () => {
    render(
      <CardHeader>
        <h2>Header</h2>
      </CardHeader>
    );
    
    const header = screen.getByText('Header').parentElement;
    expect(header).toHaveClass('border-b');
  });
});

describe('CardBody', () => {
  it('renders children', () => {
    render(
      <CardBody>
        <p>Body content</p>
      </CardBody>
    );
    
    expect(screen.getByText('Body content')).toBeInTheDocument();
  });

  it('has padding styling', () => {
    render(
      <CardBody>
        <p>Body</p>
      </CardBody>
    );
    
    const body = screen.getByText('Body').parentElement;
    expect(body).toHaveClass('px-6', 'py-4');
  });
});

describe('CardFooter', () => {
  it('renders children', () => {
    render(
      <CardFooter>
        <p>Footer content</p>
      </CardFooter>
    );
    
    expect(screen.getByText('Footer content')).toBeInTheDocument();
  });

  it('has border top and background styling', () => {
    render(
      <CardFooter>
        <p>Footer</p>
      </CardFooter>
    );
    
    const footer = screen.getByText('Footer').parentElement;
    expect(footer).toHaveClass('border-t', 'bg-[#34495e]');
  });
});

describe('Card composition', () => {
  it('renders complete card with all sections', () => {
    render(
      <Card>
        <CardHeader>
          <h2>Title</h2>
        </CardHeader>
        <CardBody>
          <p>Content</p>
        </CardBody>
        <CardFooter>
          <button>Action</button>
        </CardFooter>
      </Card>
    );
    
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();
  });
});
