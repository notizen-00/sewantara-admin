import type {
  BookingOnboardingPayload,
  BusinessOnboardingPayload,
  PaymentsOnboardingPayload,
  RegisterPayload,
  RentalOnboardingPayload,
} from '~/domain/mitra'
import { ApiRequestError } from '~/domain/api'

type OnboardingStepKey = 'business' | 'rental' | 'inventory' | 'pricing' | 'booking' | 'payment' | 'review'

export function useMitraDashboard() {
  const catalog = useCatalogStore()
  const auth = useAuthStore()
  const branches = useBranchStore()
  const onboarding = useOnboardingStore()
  const operations = useOperationsStore()
  const settings = useSettingsStore()
  const products = useProductStore()
  const bookings = useBookingStore()
  const inventory = useInventoryStore()

  const activeAuthTab = ref<'login' | 'register'>('login')
  const successMessage = ref('')
  const isInitialized = ref(false)
  const selectedOnboardingStep = ref<OnboardingStepKey>('business')

  const loginForm = reactive({
    email: '',
    password: '',
  })

  const registerForm = reactive<RegisterPayload>({
    business_name: '',
    business_type: '',
    subdomain: '',
    owner: {
      name: '',
      email: '',
      phone: '',
      password: '',
      password_confirmation: '',
    },
    plan_id: null,
    billing_interval: 'month',
    terms_accepted: false,
  })

  const businessForm = reactive<BusinessOnboardingPayload>({
    business_name: '',
    timezone: 'Asia/Jakarta',
    currency: 'IDR',
    branch_name: 'Cabang Utama',
    operating_hours: {
      monday: { open: '09:00', close: '21:00' },
      tuesday: { open: '09:00', close: '21:00' },
      wednesday: { open: '09:00', close: '21:00' },
      thursday: { open: '09:00', close: '21:00' },
      friday: { open: '09:00', close: '21:00' },
      saturday: { open: '09:00', close: '18:00' },
      sunday: { closed: true },
    },
  })

  const rentalForm = reactive<RentalOnboardingPayload>({
    rental_model: 'per_day',
    booking_strategy: 'date_range',
    allocation_strategy: 'auto_assign',
    slot_duration_minutes: null,
    enable_waiting_list: false,
    allow_extend_booking: true,
    realtime_availability: true,
  })

  const bookingForm = reactive<BookingOnboardingPayload>({
    allow_online_booking: true,
    allow_walk_in: true,
    enable_waiting_list: false,
    allocation_strategy: 'auto_assign',
    auto_reminder: true,
    auto_cancel_unpaid: true,
    auto_cancel_minutes: 30,
  })

  const transferPaymentConfig = reactive({
    bank_name: 'BCA',
    account_number: '',
    account_name: '',
  })

  const paymentsForm = reactive<PaymentsOnboardingPayload>({
    methods: [
      { method: 'cash', is_enabled: true, configuration: null },
      {
        method: 'transfer',
        is_enabled: true,
        configuration: transferPaymentConfig,
      },
    ],
  })

  const tenantName = computed(() => {
    if (auth.activeWorkspace.tenantName) return auth.activeWorkspace.tenantName
    if (auth.isAuthenticated) return auth.tenantSwitching ? 'Mengganti workspace...' : 'Sewantara Mitra'
    return auth.registeredTenant?.tenant.name || 'Sewantara Mitra'
  })
  const tenantStatusLabel = computed(() => auth.session?.tenant.status || (auth.isAuthenticated ? 'onboarding' : 'guest'))

  const errorMessage = computed(() =>
    auth.isAuthenticated
      ? auth.error || branches.error || onboarding.error || operations.error
      : auth.error || catalog.error,
  )

  const availableBranches = computed(() => {
    const currentBranch = auth.session?.branch
    const branchItems = auth.hasGlobalBranchAccess ? branches.items : currentBranch ? [currentBranch] : []

    if (!currentBranch || branchItems.some((branch) => branch.id === currentBranch.id)) {
      return branchItems
    }

    return [currentBranch, ...branchItems]
  })

  const onboardingSteps = computed(() => {
    const checklist = onboarding.progress?.checklist
    const steps: Array<{ key: OnboardingStepKey; label: string; done: boolean }> = [
      { key: 'business', label: 'Informasi Usaha', done: Boolean(checklist?.business) },
      { key: 'rental', label: 'Model Penyewaan', done: Boolean(checklist?.rental_configuration) },
      { key: 'inventory', label: 'Resource & Unit', done: Boolean(checklist?.inventory) },
      { key: 'pricing', label: 'Harga', done: Boolean(checklist?.pricing) },
      { key: 'booking', label: 'Booking', done: Boolean(checklist?.booking) },
      { key: 'payment', label: 'Pembayaran', done: Boolean(checklist?.payment) },
      { key: 'review', label: 'Review & Aktivasi', done: onboarding.completion >= 100 },
    ]

    let prerequisitesComplete = true
    return steps.map((step, index) => {
      const available = index === 0 || prerequisitesComplete || step.key === selectedOnboardingStep.value
      prerequisitesComplete = prerequisitesComplete && step.done
      return { ...step, available }
    })
  })

  const selectedStepLabel = computed(
    () => onboardingSteps.value.find((step) => step.key === selectedOnboardingStep.value)?.label || 'penyiapan awal',
  )
  const continueLabel = computed(() => {
    if (selectedOnboardingStep.value === 'review') return 'Aktifkan workspace'
    if (selectedOnboardingStep.value === 'inventory' || selectedOnboardingStep.value === 'pricing') {
      return 'Verifikasi & lanjutkan'
    }
    return 'Simpan & lanjutkan'
  })

  const metricCards = computed(() => [
    {
      key: 'revenue' as const,
      label: 'Pendapatan',
      value: formatCurrency(Number(operations.dashboard?.revenue || 0)),
      raw: Number(operations.dashboard?.revenue || 0),
      caption: 'Tercatat pada laporan tenant',
    },
    {
      key: 'bookings' as const,
      label: 'Booking',
      value: String(operations.dashboard?.bookings || 0),
      raw: Number(operations.dashboard?.bookings || 0),
      caption: 'Total booking tercatat',
    },
    {
      key: 'active_rentals' as const,
      label: 'Rental aktif',
      value: String(operations.dashboard?.active_rentals || 0),
      raw: Number(operations.dashboard?.active_rentals || 0),
      caption: 'Sedang berjalan',
    },
    {
      key: 'available_units' as const,
      label: 'Unit tersedia',
      value: String(operations.dashboard?.available_units || 0),
      raw: Number(operations.dashboard?.available_units || 0),
      caption: 'Siap disewa',
    },
  ])

  function formatCurrency(value: number) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(value)
  }

  function applyDefaultsFromCatalog() {
    if (!registerForm.business_type && catalog.templates[0]) {
      registerForm.business_type = catalog.templates[0].code
    }

    if (!registerForm.plan_id && catalog.plans[0]) {
      registerForm.plan_id = catalog.plans[0].id
    }
  }

  function resolveBackendStep(): OnboardingStepKey {
    const step = onboarding.progress?.current_step
    const checklist = onboarding.progress?.checklist

    if (step === 'rental_configuration') return 'rental'
    if (step === 'inventory_setup' || step === 'inventory') return 'inventory'
    if (step === 'pricing') return 'pricing'
    if (step === 'booking_setup' || step === 'booking') return 'booking'
    if (step === 'payment_setup' || step === 'payment') return 'payment'
    if (step === 'review' || step === 'go_live' || step === 'completed') return 'review'
    if (step === 'business_setup' || step === 'business_template' || step === 'business') return 'business'

    if (!checklist?.business) return 'business'
    if (!checklist.rental_configuration) return 'rental'
    if (!checklist.inventory) return 'inventory'
    if (!checklist.pricing) return 'pricing'
    if (!checklist.booking) return 'booking'
    if (!checklist.payment) return 'payment'
    return 'review'
  }

  function syncSelectedStep() {
    selectedOnboardingStep.value = resolveBackendStep()
  }

  function hydrateOnboardingForms() {
    const progress = onboarding.progress
    if (!progress) return

    const profile = progress.profile as Partial<BusinessOnboardingPayload>
    if (typeof profile.business_name === 'string') {
      businessForm.business_name = profile.business_name
    } else if (auth.session?.tenant.name) {
      businessForm.business_name = auth.session.tenant.name
    }
    if (typeof profile.timezone === 'string') businessForm.timezone = profile.timezone
    if (typeof profile.currency === 'string') businessForm.currency = profile.currency
    if (typeof profile.branch_name === 'string') {
      businessForm.branch_name = profile.branch_name
    } else if (auth.session?.branch.name) {
      businessForm.branch_name = auth.session.branch.name
    }
    if (profile.operating_hours && typeof profile.operating_hours === 'object') {
      Object.assign(businessForm.operating_hours, profile.operating_hours)
    }

    const rentalConfiguration = progress.rental_configuration as Partial<RentalOnboardingPayload>
    Object.assign(rentalForm, rentalConfiguration)

    for (const method of progress.payment_methods || []) {
      const target = paymentsForm.methods.find((item) => item.method === method.method)
      if (!target) continue
      target.is_enabled = method.is_enabled

      if (method.method === 'transfer' && method.configuration) {
        Object.assign(transferPaymentConfig, method.configuration)
      }
    }
  }

  async function refreshTenantData(refreshSession = true) {
    if (!auth.isAuthenticated) return

    if (refreshSession) {
      await auth.fetchSession()
    }

    if (auth.tenantStatus === 'onboarding') {
      branches.useCurrentBranch(auth.session?.branch)
      await onboarding.fetchProgress()
      hydrateOnboardingForms()
      syncSelectedStep()
    } else if (auth.tenantStatus === 'active') {
      if (auth.hasGlobalBranchAccess) {
        await branches.fetchAll()
      } else {
        branches.useCurrentBranch(auth.session?.branch)
      }

      await operations.fetchDashboard()
    }
  }

  async function submitRegister() {
    successMessage.value = ''
    try {
      await auth.register(registerForm)
      successMessage.value = 'Akun bisnis berhasil dibuat. Masuk dengan email dan password owner untuk memulai onboarding.'
      loginForm.email = registerForm.owner.email
      activeAuthTab.value = 'login'
    } catch {
      // Store menampilkan pesan error dari backend.
    }
  }

  async function submitLogin() {
    successMessage.value = ''
    try {
      await auth.login(loginForm.email, loginForm.password)
      businessForm.business_name = auth.session?.tenant.name || businessForm.business_name
      await refreshTenantData(false)
    } catch {
      // Store menampilkan pesan error dari backend.
    }
  }

  async function runOnboardingAction(action: () => Promise<unknown>, message: string, advance = true) {
    successMessage.value = ''
    try {
      await action()
      successMessage.value = message
      if (advance) syncSelectedStep()
      return true
    } catch {
      return false
    }
  }

  function saveBusiness(advance = true) {
    return runOnboardingAction(() => onboarding.saveBusiness(businessForm), 'Informasi usaha tersimpan.', advance)
  }

  function saveRental(advance = true) {
    return runOnboardingAction(() => onboarding.saveRental(rentalForm), 'Konfigurasi rental tersimpan.', advance)
  }

  function completeInventory(advance = true) {
    return runOnboardingAction(() => onboarding.completeInventory(), 'Inventory berhasil diverifikasi.', advance)
  }

  function completePricing(advance = true) {
    return runOnboardingAction(() => onboarding.completePricing(), 'Harga berhasil diverifikasi.', advance)
  }

  function saveBooking(advance = true) {
    return runOnboardingAction(() => onboarding.saveBooking(bookingForm), 'Konfigurasi booking tersimpan.', advance)
  }

  function savePayments(advance = true) {
    paymentsForm.methods[1].configuration = transferPaymentConfig
    return runOnboardingAction(() => onboarding.savePayments(paymentsForm), 'Metode pembayaran tersimpan.', advance)
  }

  async function goLive() {
    successMessage.value = ''
    try {
      await onboarding.goLive()
      await refreshTenantData()
      successMessage.value = 'Workspace aktif dan siap digunakan.'
      return true
    } catch {
      return false
    }
  }

  function selectOnboardingStep(step: string) {
    const target = onboardingSteps.value.find((item) => item.key === step)
    if (!target?.available) return
    selectedOnboardingStep.value = target.key
    successMessage.value = ''
  }

  function goToPreviousStep() {
    const currentIndex = onboardingSteps.value.findIndex((step) => step.key === selectedOnboardingStep.value)
    if (currentIndex <= 0) return
    selectedOnboardingStep.value = onboardingSteps.value[currentIndex - 1].key
    successMessage.value = ''
  }

  async function saveCurrentStep(advance: boolean) {
    if (!advance && ['inventory', 'pricing', 'review'].includes(selectedOnboardingStep.value)) {
      successMessage.value = 'Progress onboarding sudah tersimpan di workspace.'
      return true
    }

    if (selectedOnboardingStep.value === 'business') return saveBusiness(advance)
    if (selectedOnboardingStep.value === 'rental') return saveRental(advance)
    if (selectedOnboardingStep.value === 'inventory') return completeInventory(advance)
    if (selectedOnboardingStep.value === 'pricing') return completePricing(advance)
    if (selectedOnboardingStep.value === 'booking') return saveBooking(advance)
    if (selectedOnboardingStep.value === 'payment') return savePayments(advance)
    if (advance) return goLive()

    successMessage.value = 'Review onboarding tersimpan.'
    return true
  }

  function saveDraft() {
    return saveCurrentStep(false)
  }

  async function continueSetup() {
    if (auth.tenantStatus === 'active') {
      await operations.fetchDashboard()
      return
    }

    await saveCurrentStep(true)
  }

  async function saveAndExit() {
    if (auth.tenantStatus === 'onboarding') {
      const saved = await saveCurrentStep(false)
      if (!saved) return
    }

    await logout()
  }

  async function switchBranch(branchId: number) {
    successMessage.value = ''
    const targetBranch = availableBranches.value.find((branch) => branch.id === branchId)
    if (!targetBranch?.is_active) return

    try {
      await auth.switchBranch(branchId)
      await operations.fetchDashboard()
      successMessage.value = `Cabang ${auth.activeBranch?.name || 'aktif'} sedang digunakan.`
    } catch {
      // Store menampilkan pesan error dari backend.
    }
  }

  async function switchTenant(tenantId: string, branchId = 1) {
    successMessage.value = ''

    try {
      await auth.switchTenant(tenantId, branchId)
      branches.clear()
      onboarding.progress = null
      operations.dashboard = null
      settings.reset()
      products.reset()
      bookings.reset()
      inventory.reset()
      await refreshTenantData(false)
      successMessage.value = `Workspace ${auth.session?.tenant.name || 'aktif'} sedang digunakan.`
    } catch {
      // Store menampilkan pesan error dari backend dan mengembalikan konteks sebelumnya.
    }
  }

  async function logout() {
    await auth.logout()
    branches.clear()
    onboarding.progress = null
    operations.dashboard = null
    settings.reset()
    products.reset()
    bookings.reset()
    inventory.reset()
    successMessage.value = ''

    if (!catalog.templates.length || !catalog.plans.length) {
      await catalog.fetchCatalog()
      applyDefaultsFromCatalog()
    }
  }

  async function initialize() {
    if (isInitialized.value) return

    try {
      auth.hydrateFromStorage()
      const catalogRequest = catalog.fetchCatalog()

      if (auth.isAuthenticated) {
        const [, tenantResult] = await Promise.allSettled([catalogRequest, refreshTenantData()])
        if (tenantResult.status === 'rejected') {
          const err = tenantResult.reason
          if (err instanceof ApiRequestError && [401, 403, 423].includes(err.status)) {
            auth.clearSession()
          }
        }
      } else {
        await catalogRequest
      }

      applyDefaultsFromCatalog()
    } finally {
      isInitialized.value = true
    }
  }

  watch(
    () => catalog.plans.length + catalog.templates.length,
    applyDefaultsFromCatalog,
  )

  return reactive({
    activeAuthTab,
    auth,
    availableBranches,
    branches,
    bookingForm,
    businessForm,
    catalog,
    continueLabel,
    errorMessage,
    formatCurrency,
    isInitialized,
    loginForm,
    metricCards,
    onboarding,
    onboardingSteps,
    operations,
    paymentsForm,
    registerForm,
    rentalForm,
    selectedOnboardingStep,
    selectedStepLabel,
    successMessage,
    tenantName,
    tenantStatusLabel,
    transferPaymentConfig,
    completeInventory,
    completePricing,
    goLive,
    initialize,
    logout,
    goToPreviousStep,
    saveAndExit,
    saveBooking,
    saveDraft,
    saveBusiness,
    continueSetup,
    savePayments,
    saveRental,
    selectOnboardingStep,
    switchTenant,
    switchBranch,
    submitLogin,
    submitRegister,
  })
}

export type MitraDashboardPresenter = ReturnType<typeof useMitraDashboard>
