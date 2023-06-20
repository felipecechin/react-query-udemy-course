import { createStandaloneToast } from '@chakra-ui/react';
import { MutationCache, QueryCache, QueryClient } from 'react-query';

import { theme } from '../theme';

const toast = createStandaloneToast({ theme });

function queryErrorHandler(errorMessage: string): void {
  toast({
    title: errorMessage,
    status: 'error',
    variant: 'subtle',
    isClosable: true,
  });
}

export function generateQueryClient(): QueryClient {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        let message: string;
        if (query.meta?.errorMessage) {
          message = query.meta.errorMessage as string;
        } else if (error instanceof Error) {
          message = error.message;
        } else {
          message = 'error connecting to server';
        }

        queryErrorHandler(message);
      },
    }),
    mutationCache: new MutationCache({
      onError: (error) => {
        if (error instanceof Error) {
          queryErrorHandler(error.message);
        } else {
          queryErrorHandler('error connecting to server');
        }
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: 600000, // 10 minutes
        cacheTime: 900000, // 15 minutes
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
      },
    },
  });
}

export const queryClient = generateQueryClient();
