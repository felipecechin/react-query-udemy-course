import { screen } from '@testing-library/react';
import { server } from 'mocks/server';
import { rest } from 'msw';
import { renderWithQueryClient } from 'test-utils';

import { AllStaff } from '../AllStaff';

test('renders response from query', async () => {
  renderWithQueryClient(<AllStaff />);

  const staffTitles = await screen.findAllByRole('heading', {
    name: /sandra|divya|mateo|michael/i,
  });

  expect(staffTitles).toHaveLength(4);
});

test('handles query error', async () => {
  // (re)set handler to return a 500 error for staff
  server.resetHandlers(
    rest.get('http://localhost:3030/staff', (req, res, ctx) => {
      return res(ctx.status(500));
    }),
  );

  renderWithQueryClient(<AllStaff />);

  const alertToast = await screen.findByRole('alert');
  expect(alertToast).toHaveTextContent('Request failed with status code 500');
});
