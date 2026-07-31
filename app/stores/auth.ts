import { defineStore } from 'pinia'
import type {
  RegisterPayload,
  RegisterResult,
  TenantSession,
} from '~/domain/mitra'
import { useAuthRepository } from '~/infrastructure/repositories/authRepository'

const storageKeys = {
  token: 'sewantara.access_token',
  tenant: 'sewantara.tenant_id',
  branch: 'sewantara.branch_id',
}

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref('')
  const tenantId = ref('')
  const branchId = ref('1')
  const session = ref<TenantSession | null>(null)
  const registeredTenant = ref<RegisterResult | null>(null)
  const loading = ref(false)
  const tenantSwitching = ref(false)
  const branchSwitching = ref(false)
  const error = ref('')

  const isAuthenticated = computed(() => Boolean(accessToken.value && tenantId.value))
  const tenantStatus = computed(() => session.value?.tenant.status || 'onboarding')
  const subscription = computed(() => session.value?.subscription || null)
  const roles = computed(() => session.value?.roles || session.value?.user.roles || [])
  const hasGlobalBranchAccess = computed(() =>
    roles.value.some((role) => role.code === 'owner' && role.pivot?.branch_id === null),
  )
  const activeBranch = computed(() => session.value?.branch || null)
  const activeWorkspace = computed(() => ({
    tenantId: tenantId.value,
    tenantName: session.value?.tenant.id === tenantId.value ? session.value.tenant.name : '',
    branchId: branchId.value,
    branchName: session.value?.branch.id === Number(branchId.value) ? session.value.branch.name : '',
  }))

  function persist() {
    if (!process.client) return

    if (accessToken.value) localStorage.setItem(storageKeys.token, accessToken.value)
    if (tenantId.value) localStorage.setItem(storageKeys.tenant, tenantId.value)
    if (branchId.value) localStorage.setItem(storageKeys.branch, branchId.value)
  }

  function setTenantContext(nextTenantId: string, nextBranchId: string | number) {
    tenantId.value = nextTenantId
    branchId.value = String(nextBranchId)
    persist()
  }

  function syncBranchId(nextBranchId: string | number) {
    const normalizedBranchId = Number(nextBranchId)
    if (!Number.isInteger(normalizedBranchId) || normalizedBranchId < 1) return

    branchId.value = String(normalizedBranchId)
    persist()
  }

  function clearPersisted() {
    if (!process.client) return
    Object.values(storageKeys).forEach((key) => localStorage.removeItem(key))
  }

  function hydrateFromStorage() {
    if (!process.client) return
    accessToken.value = localStorage.getItem(storageKeys.token) || ''
    tenantId.value = localStorage.getItem(storageKeys.tenant) || ''
    branchId.value = localStorage.getItem(storageKeys.branch) || '1'
  }

  function clearSession() {
    accessToken.value = ''
    tenantId.value = ''
    branchId.value = '1'
    session.value = null
    clearPersisted()
  }

  async function register(payload: RegisterPayload) {
    loading.value = true
    error.value = ''

    try {
      const response = await useAuthRepository().register(payload)
      registeredTenant.value = response.data
      tenantId.value = response.data.tenant.id
      persist()
      return response.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Registrasi tenant gagal.'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function login(email: string, password: string) {
    loading.value = true
    error.value = ''

    try {
      const response = await useAuthRepository().login(email, password)
      accessToken.value = response.data.access_token
      tenantId.value = response.data.user.tenant_id
      persist()
      await fetchSession()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login gagal.'
      clearSession()
      error.value = message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchSession() {
    if (!isAuthenticated.value) return

    try {
      const response = await useAuthRepository().me()
      session.value = response.data
      branchId.value = String(response.data.branch.id)
      persist()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Session tenant gagal dimuat.'
      throw err
    }
  }

  async function switchBranch(nextBranchId: number) {
    if (!Number.isInteger(nextBranchId) || nextBranchId < 1) return session.value

    const previousBranchId = branchId.value
    branchSwitching.value = true
    error.value = ''

    try {
      syncBranchId(nextBranchId)
      await fetchSession()
      return session.value
    } catch (err) {
      syncBranchId(previousBranchId)
      error.value = err instanceof Error ? err.message : 'Cabang aktif gagal diganti.'
      throw err
    } finally {
      branchSwitching.value = false
    }
  }

  async function switchTenant(nextTenantId: string, nextBranchId = 1) {
    const normalizedTenantId = nextTenantId.trim()
    if (!normalizedTenantId || !Number.isInteger(nextBranchId) || nextBranchId < 1) {
      return session.value
    }

    if (normalizedTenantId === tenantId.value && String(nextBranchId) === branchId.value) {
      return session.value
    }

    const previousTenantId = tenantId.value
    const previousBranchId = branchId.value
    const previousSession = session.value
    tenantSwitching.value = true
    error.value = ''

    try {
      setTenantContext(normalizedTenantId, nextBranchId)
      session.value = null
      await fetchSession()
      return session.value
    } catch (err) {
      setTenantContext(previousTenantId, previousBranchId)
      session.value = previousSession
      error.value = err instanceof Error ? err.message : 'Tenant aktif gagal diganti.'
      throw err
    } finally {
      tenantSwitching.value = false
    }
  }

  async function logout() {
    loading.value = true
    error.value = ''

    try {
      if (isAuthenticated.value) {
        await useAuthRepository().logout()
      }
    } catch {
      // Token lokal tetap dibersihkan supaya user tidak tersangkut di session rusak.
    } finally {
      clearSession()
      loading.value = false
    }
  }

  return {
    accessToken,
    tenantId,
    branchId,
    session,
    registeredTenant,
    subscription,
    loading,
    tenantSwitching,
    branchSwitching,
    error,
    isAuthenticated,
    tenantStatus,
    roles,
    hasGlobalBranchAccess,
    activeBranch,
    activeWorkspace,
    hydrateFromStorage,
    clearSession,
    register,
    login,
    fetchSession,
    syncBranchId,
    switchTenant,
    switchBranch,
    logout,
  }
})
