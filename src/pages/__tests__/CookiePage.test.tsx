import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CookiePage from '../CookiePage';

// Mock the PolicyPage component
jest.mock('@/components/PolicyPage', () => {
  return function MockPolicyPage({ title, description }: { title: string; description: string }) {
    return (
      <div>
        <h1>{title}</h1>
        <p>{description}</p>
        <p>Last updated: January 15, 2024</p>
      </div>
    );
  };
});

// Mock Navigation and Footer
jest.mock('@/components/Navigation', () => {
  return function MockNavigation() {
    return <nav>Navigation</nav>;
  };
});

jest.mock('@/components/Footer', () => {
  return function MockFooter() {
    return <footer>Footer</footer>;
  };
});

jest.mock('@/components/CookiePreferences', () => {
  return function MockCookiePreferences() {
    return <div>Cookie Preferences</div>;
  };
});

describe('CookiePage', () => {
  it('renders the H1 title correctly', () => {
    render(
      <BrowserRouter>
        <CookiePage />
      </BrowserRouter>
    );
    
    const heading = screen.getByText('Cookie Policy');
    expect(heading).toBeInTheDocument();
    expect(heading.tagName).toBe('H1');
  });

  it('renders "Last updated" text', () => {
    render(
      <BrowserRouter>
        <CookiePage />
      </BrowserRouter>
    );
    
    const lastUpdated = screen.getByText(/Last updated:/i);
    expect(lastUpdated).toBeInTheDocument();
  });
});

