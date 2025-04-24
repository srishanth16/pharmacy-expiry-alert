import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Pharmacy Expiry Alert heading', () => {
  render(<App />);
  const headingElement = screen.getByText(/Pharmacy Expiry Alert/i);
  expect(headingElement).toBeInTheDocument();
});
