<script setup lang="ts">
import type { Branch } from '~/domain/mitra'

defineProps<{
  tenantName: string
  tenantId: string
  activeWorkspaceName?: string
  branches: Branch[]
  activeBranchId: string
  branchSwitching?: boolean
  userName: string
  userEmail: string
}>()

defineEmits<{
  logout: []
  selectBranch: [branchId: number]
}>()

const sidebarOpen = ref(false)
const sidebarCollapsed = ref(false)
const activeSection = ref('overview')
const bookingCreateRequest = ref(0)

function selectSection(section: string) {
  activeSection.value = section
}

function requestBookingCreate() {
  activeSection.value = 'bookings'
  bookingCreateRequest.value += 1
}

function toggleSidebarCollapse() {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

onMounted(() => {
  sidebarCollapsed.value = localStorage.getItem('sewantara.sidebar_collapsed') === 'true'
})

watch(sidebarCollapsed, (collapsed) => {
  if (process.client) localStorage.setItem('sewantara.sidebar_collapsed', String(collapsed))
})

watch(activeSection, (section) => {
  if (section !== 'bookings') bookingCreateRequest.value = 0
})
</script>

<template>
  <main class="min-h-screen bg-neutral-50 text-neutral-900">
    <OrganismsOperationsSidebar
      :open="sidebarOpen"
      :collapsed="sidebarCollapsed"
      :tenant-name="tenantName"
      :tenant-id="tenantId"
      :active-workspace-name="activeWorkspaceName"
      :active-section="activeSection"
      @close="sidebarOpen = false"
      @toggle-collapse="toggleSidebarCollapse"
      @select="selectSection"
    />
    <OrganismsOperationsHeader
      :branches="branches"
      :active-branch-id="activeBranchId"
      :branch-switching="branchSwitching"
      :user-name="userName"
      :user-email="userEmail"
      :notification-count="0"
      :sidebar-collapsed="sidebarCollapsed"
      @menu="sidebarOpen = true"
      @logout="$emit('logout')"
      @select-branch="$emit('selectBranch', $event)"
      @create-booking="requestBookingCreate"
      @navigate="selectSection"
    />

    <div
      :class="[
        'min-h-screen pt-16 transition-[padding] duration-200',
        sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64',
      ]"
    >
      <div
        :class="[
          'mx-auto w-full px-4 py-6 transition-[max-width] duration-200 sm:px-6 lg:px-8 lg:py-8',
          sidebarCollapsed ? 'max-w-[1760px]' : 'max-w-[1440px]',
        ]"
      >
        <slot
          :active-section="activeSection"
          :navigate="selectSection"
          :booking-create-request="bookingCreateRequest"
        />
      </div>
    </div>
  </main>
</template>
