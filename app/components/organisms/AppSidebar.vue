<script setup lang="ts">
defineProps<{
  completion: number
  currentStep: string
  steps: Array<{ key: string; label: string; done: boolean; available: boolean }>
}>()

defineEmits<{
  selectStep: [step: string]
}>()
</script>

<template>
  <aside class="sticky top-20 h-[calc(100vh-5rem)] border-r border-neutral-200 bg-neutral-0 px-5 py-6 max-lg:static max-lg:h-auto max-lg:border-b max-lg:border-r-0">
    <div class="mb-5">
      <p class="text-xs font-semibold uppercase text-neutral-500">Progress onboarding</p>
      <div class="mt-3 h-2 rounded-full bg-neutral-100">
        <div class="h-2 rounded-full bg-primary-600 transition-all" :style="{ width: `${completion}%` }"></div>
      </div>
      <p class="mt-2 text-sm font-semibold text-neutral-700">{{ completion }}% selesai</p>
    </div>

    <nav class="grid gap-1" aria-label="Progress onboarding">
      <button
        v-for="(step, index) in steps"
        :key="step.key"
        type="button"
        :disabled="!step.available"
        :class="[
          'grid w-full grid-cols-[28px_minmax(0,1fr)] items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition disabled:cursor-not-allowed disabled:opacity-60',
          currentStep === step.key
            ? 'bg-primary-50 font-semibold text-primary-700'
            : step.done
              ? 'text-neutral-900 hover:bg-neutral-50'
              : 'text-neutral-500 hover:bg-neutral-50',
        ]"
        @click="$emit('selectStep', step.key)"
      >
        <span
          :class="[
            'grid h-6 w-6 place-items-center rounded-full border text-[11px] font-semibold',
            step.done
              ? 'border-primary-600 bg-primary-600 text-white'
              : currentStep === step.key
                ? 'border-primary-600 bg-primary-50 text-primary-700'
                : 'border-neutral-200 bg-neutral-0 text-neutral-500',
          ]"
        >
          {{ step.done ? 'OK' : index + 1 }}
        </span>
        <span class="truncate">{{ step.label }}</span>
      </button>
    </nav>
  </aside>
</template>
