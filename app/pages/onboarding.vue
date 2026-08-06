<script setup lang="ts">
import { useMitraDashboard } from '~/application/mitra/useMitraDashboard'

useHead({ title: 'Onboarding — Sewantara Mitra' })

const dashboard = useMitraDashboard()
</script>

<template>
  <TemplatesDashboardLayout
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
</template>
