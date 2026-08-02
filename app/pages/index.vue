<script setup lang="ts">
import { useMitraDashboard } from '~/application/mitra/useMitraDashboard'

useHead({
  title: 'Sewantara Mitra Dashboard',
  meta: [
    {
      name: 'description',
      content: 'Dashboard mitra SaaS Sewantara untuk registrasi, onboarding, dan operasional tenant.',
    },
  ],
})

const dashboard = useMitraDashboard()
const snackbar = useSnackbarStore()

onMounted(dashboard.initialize)

watch(
  () => dashboard.successMessage,
  (message) => {
    if (message) snackbar.success(message)
  },
)

watch(
  () => dashboard.errorMessage,
  (message) => {
    if (message) snackbar.error(message)
  },
)
</script>

<template>
  <TemplatesAuthLayout v-if="!dashboard.isInitialized">
    <div class="grid justify-items-center gap-4 text-center">
      <MoleculesBrandLockup />
      <p class="text-sm font-medium text-neutral-500">Memulihkan sesi...</p>
    </div>
  </TemplatesAuthLayout>

  <TemplatesAuthLayout v-else-if="!dashboard.auth.isAuthenticated">
    <OrganismsAuthGateway :dashboard="dashboard" />
  </TemplatesAuthLayout>

  <main v-else-if="dashboard.requiresBillingRecovery" class="min-h-screen bg-neutral-50 px-4 py-8 text-neutral-900 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-6xl">
      <div class="mb-6 flex items-center justify-between gap-4">
        <MoleculesBrandLockup />
        <AtomsAppButton variant="ghost" @click="dashboard.logout">Keluar</AtomsAppButton>
      </div>
      <MoleculesNoticeBanner
        tone="danger"
        message="Akses operasional ditahan sampai subscription aktif. Kamu tetap bisa membuka checkout pembayaran di bawah ini."
      />
      <div class="mt-6">
        <OrganismsBillingWorkspace :show-back="false" />
      </div>
    </div>
  </main>

  <TemplatesDashboardLayout
    v-else-if="dashboard.auth.tenantStatus === 'onboarding'"
    :backend-online="dashboard.catalog.backendOnline"
    :tenant-id="dashboard.auth.tenantId"
    :onboarding-mode="true"
    :completion="dashboard.onboarding.completion"
    :current-step="dashboard.selectedOnboardingStep"
    :steps="dashboard.onboardingSteps"
    :continue-label="dashboard.continueLabel"
    :busy="dashboard.auth.loading || dashboard.onboarding.loading"
    @save-exit="dashboard.saveAndExit"
    @save-draft="dashboard.saveDraft"
    @continue="dashboard.continueSetup"
    @back="dashboard.goToPreviousStep"
    @select-step="dashboard.selectOnboardingStep"
  >
    <OrganismsDashboardTopbar
      :tenant-name="dashboard.tenantName"
      :tenant-status="dashboard.tenantStatusLabel"
      :current-step="dashboard.selectedStepLabel"
    />

    <OrganismsOnboardingWorkspace :dashboard="dashboard" />
  </TemplatesDashboardLayout>

  <TemplatesOperationsLayout
    v-else
    :tenant-name="dashboard.tenantName"
    :tenant-id="dashboard.auth.tenantId"
    :active-workspace-name="dashboard.auth.activeWorkspace.branchName"
    :branches="dashboard.availableBranches"
    :active-branch-id="dashboard.auth.branchId"
    :branch-switching="dashboard.auth.branchSwitching || dashboard.branches.loading"
    :user-name="dashboard.auth.session?.user.name || 'Owner'"
    :user-email="dashboard.auth.session?.user.email || ''"
    @logout="dashboard.logout"
    @select-branch="dashboard.switchBranch"
  >
    <template #default="{ activeSection, navigate, bookingCreateRequest }">
      <div>
        <OrganismsOperationsDashboard
          :section="activeSection"
          :metrics="dashboard.metricCards"
          :subscription="dashboard.subscriptionSummary"
          :loading="dashboard.operations.loading"
          :booking-create-request="bookingCreateRequest"
          @refresh="dashboard.refreshDashboard"
          @navigate="navigate"
        />
      </div>
    </template>
  </TemplatesOperationsLayout>
</template>
