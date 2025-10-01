import { useRuntimeConfig } from 'nuxt/app';
import type { CreateUserInput, UserResponse } from '~/schemas/user.schema';

export const useApi = () => {
  const config = useRuntimeConfig();
  const baseURL = config.public.apiBaseUrl;

  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    try {
      const response = await fetch(`${baseURL}${url}`, {
        ...options,
        headers: {
          ...(options.body ? { 'Content-Type': 'application/json' } : {}),
          ...options.headers,
        },
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const error = await response.json();
          throw new Error(error.error || 'Request failed');
        } else {
          throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return;
      }

      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error(
          'Cannot connect to API server. Make sure the backend is running at ' + baseURL
        );
      }
      throw error;
    }
  };

  return {
    users: {
      getAll: (): Promise<UserResponse[]> => {
        return fetchWithAuth('/api/users');
      },

      getById: (id: number): Promise<UserResponse> => {
        return fetchWithAuth(`/api/users/${id}`);
      },

      create: (data: CreateUserInput): Promise<UserResponse> => {
        return fetchWithAuth('/api/users', {
          method: 'POST',
          body: JSON.stringify(data),
        });
      },

      update: (id: number, data: Partial<CreateUserInput>): Promise<UserResponse> => {
        return fetchWithAuth(`/api/users/${id}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        });
      },

      delete: (id: number): Promise<void> => {
        return fetchWithAuth(`/api/users/${id}`, {
          method: 'DELETE',
        });
      },
    },
  };
};
