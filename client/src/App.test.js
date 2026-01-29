import { render, screen } from '@testing-library/react';
import App from './Layouts/App';

test('renders exam hall finder', () => {
  render(<App />);
  const headingElement = screen.getByText(/Exam Hall Finder/i);
  expect(headingElement).toBeInTheDocument();
});
