<script setup lang="ts">
defineProps<{
  options: Array<{ label: string; value: string }>
}>()

const model = defineModel<string>({ required: true })
</script>

<template>
  <div class="grid grid-cols-2 gap-1 rounded-md bg-neutral-100 p-1">
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      :class="[
        'min-h-10 rounded-sm text-sm font-semibold transition',
        model === option.value ? 'bg-neutral-0 text-primary-700 shadow-card' : 'text-neutral-500 hover:text-neutral-700',
      ]"
      @click="model = option.value"
    >
      {{ option.label }}
    </button>
  </div>
</template>
