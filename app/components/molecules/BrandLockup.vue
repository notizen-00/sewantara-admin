<script setup lang="ts">
withDefaults(
  defineProps<{
    tone?: 'light' | 'dark'
  }>(),
  {
    tone: 'light',
  },
)
</script>

<template>
  <div class="flex items-center gap-3">
    <span class="grid h-9 w-9 place-items-center rounded-md bg-primary-600 text-sm font-black text-white">S</span>
    <div>
      <p :class="['text-[11px] font-semibold uppercase leading-none', tone === 'dark' ? 'text-primary-100' : 'text-neutral-500']">
        Sewantara
      </p>
      <h1 :class="['text-base font-bold leading-tight', tone === 'dark' ? 'text-white' : 'text-neutral-900']">Admin</h1>
    </div>
  </div>
</template>
