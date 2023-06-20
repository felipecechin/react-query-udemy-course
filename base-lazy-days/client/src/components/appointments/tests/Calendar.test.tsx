import { screen, waitFor } from '@testing-library/react';
import { rest } from 'msw';
import { renderWithQueryClient } from 'test-utils';

import { server } from '../../../mocks/server';
// import { defaultQueryClientOptions } from '../../../react-query/queryClient';
import { Calendar } from '../Calendar';

// mocking useUser to mimic a logged-in user
// jest.mock('../../user/hooks/useUser', () => ({
//   __esModule: true,
//   useUser: () => ({ user: mockUser }),
// }));

test('Reserve appointment error', async () => {
  // (re)set handler to return a 500 error for appointments
  server.resetHandlers(
    rest.get(
      'http://localhost:3030/appointments/:month/:year',
      (req, res, ctx) => {
        return res(ctx.status(500));
      },
    ),
  );

  renderWithQueryClient(<Calendar />);

  await waitFor(() => {
    const alertToasts = screen.getAllByRole('alert');
    expect(alertToasts).toHaveLength(4);
    alertToasts.map((toast) =>
      expect(toast).toHaveTextContent('Request failed with status code 500'),
    );
  });
});
