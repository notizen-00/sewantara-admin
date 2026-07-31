import type { LoginResult, RegisterPayload, RegisterResult, TenantSession } from '~/domain/mitra'
import { useApiClient } from '~/composables/useApiClient'

export function useAuthRepository() {
  const api = useApiClient()

  return {
    register: (payload: RegisterPayload) =>
      api.central<RegisterResult>('/central/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    login: (email: string, password: string) =>
      api.central<LoginResult>('/tenant/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password, device_name: 'mitra-dashboard' }),
      }),
    me: () => api.tenant<TenantSession>('/me'),
    logout: () =>
      api.tenant<null>('/auth/logout', {
        method: 'POST',
      }),
  }
}
