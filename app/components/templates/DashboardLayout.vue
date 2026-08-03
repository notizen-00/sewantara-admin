<script setup lang="ts">
defineProps<{
  backendOnline: boolean | null
  tenantId?: string
  onboardingMode: boolean
  completion: number
  currentStep: string
  steps: Array<{ key: string; label: string; done: boolean; available: boolean }>
  continueLabel?: string
  busy?: boolean
}>()

defineEmits<{
  saveExit: []
  saveDraft: []
  continue: []
  back: []
  selectStep: [step: string]
}>()
</script>

<template>
  <main class="min-h-screen bg-neutral-50 text-neutral-900">
    <header class="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-neutral-200 bg-neutral-0 px-6 shadow-card">
      <MoleculesBrandLockup />
      <div class="flex items-center gap-3">
        <MoleculesConnectionStatus class="hidden min-w-56 lg:flex" :online="backendOnline" :tenant-id="tenantId" />
        <AtomsAppButton variant="ghost" type="button">Bantuan</AtomsAppButton>
        <AtomsAppButton variant="secondary" type="button" :disabled="busy" @click="$emit('saveExit')">
          {{ onboardingMode ? 'Simpan & keluar' : 'Keluar' }}
        </AtomsAppButton>
      </div>
    </header>

    <div :class="onboardingMode ? 'grid grid-cols-[280px_minmax(0,1fr)] max-lg:grid-cols-1' : 'block'">
      <OrganismsAppSidebar
        v-if="onboardingMode"
        :completion="completion"
        :current-step="currentStep"
        :steps="steps"
        @select-step="$emit('selectStep', $event)"
      />
      <section class="grid content-start gap-6 px-8 py-8 pb-28 max-sm:px-4">
        <div :class="['w-full', onboardingMode ? 'max-w-[880px]' : 'mx-auto max-w-7xl']">
          <slot />
        </div>
      </section>
    </div>

    <footer
      v-if="onboardingMode"
      class="sticky bottom-0 z-20 flex min-h-[72px] items-center justify-between border-t border-neutral-200 bg-neutral-0/95 px-8 shadow-card backdrop-blur max-sm:flex-col max-sm:items-stretch max-sm:gap-3 max-sm:px-4 max-sm:py-3"
    >
      <div>
        <p class="text-sm font-semibold text-neutral-700">Pengaturan onboarding</p>
        <p class="text-xs text-neutral-500">Perubahan tersimpan pada setiap tahap.</p>
      </div>
      <div class="flex flex-wrap justify-end gap-3">
        <AtomsAppButton variant="ghost" type="button" :disabled="busy" @click="$emit('back')">Kembali</AtomsAppButton>
        <AtomsAppButton variant="secondary" type="button" :disabled="busy" @click="$emit('saveDraft')">Simpan draft</AtomsAppButton>
        <AtomsAppButton type="button" :disabled="busy" @click="$emit('continue')">
          {{ busy ? 'Menyimpan...' : continueLabel || 'Simpan & lanjutkan' }}
        </AtomsAppButton>
      </div>
    </footer>
  </main>
</template>
