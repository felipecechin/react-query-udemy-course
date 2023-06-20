import { renderHook } from '@testing-library/react-hooks';
import { act } from 'react-dom/test-utils';
import { createQueryClientWrapper } from 'test-utils';

import { useStaff } from '../hooks/useStaff';

test('filter staff', async () => {
  const { result, waitFor } = renderHook(() => useStaff(), {
    wrapper: createQueryClientWrapper(),
  });

  // to get your bearings
  // console.log(result);
  // console.log(result.current);

  // wait for the appointments to populate
  await waitFor(() => result.current.staff.length === 4);

  // set to filter to all appointments
  act(() => result.current.setFilter('facial'));

  // wait for the appointments to show more than when filtered
  await waitFor(() => {
    return result.current.staff.length === 3;
  });
});
