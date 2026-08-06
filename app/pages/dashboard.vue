<script setup lang="ts">
import { useMitraDashboard } from '~/application/mitra/useMitraDashboard'

useHead({ title: 'Dashboard — Sewantara Mitra' })

const dashboard = useMitraDashboard()
</script>

<template>
  <TemplatesOperationsLayout
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
