<script setup lang="ts">
import { ImageOff, LoaderCircle } from '@lucide/vue'

const props = withDefaults(
  defineProps<{
    url?: string | null
    alt: string
    imageClass?: string
  }>(),
  {
    url: null,
    imageClass: 'h-full w-full object-cover',
  },
)

const objectUrl = ref('')
const loading = ref(false)
const failed = ref(false)
let loadVersion = 0

function revokeCurrentUrl() {
  if (objectUrl.value) URL.revokeObjectURL(objectUrl.value)
  objectUrl.value = ''
}

async function load() {
  const version = ++loadVersion
  revokeCurrentUrl()
  failed.value = false
  if (!props.url || !process.client) return

  loading.value = true
  try {
    const blob = await useApiClient().tenantMedia(props.url)
    if (version !== loadVersion) return
    objectUrl.value = URL.createObjectURL(blob)
  } catch {
    if (version === loadVersion) failed.value = true
  } finally {
    if (version === loadVersion) loading.value = false
  }
}

watch(() => props.url, load, { immediate: true })
onBeforeUnmount(() => {
  loadVersion += 1
  revokeCurrentUrl()
})
</script>

<template>
  <div class="relative overflow-hidden bg-neutral-100">
    <img v-if="objectUrl" :src="objectUrl" :alt="alt" :class="imageClass" />
    <span v-else class="absolute inset-0 grid place-items-center text-neutral-400">
      <LoaderCircle v-if="loading" :size="18" class="animate-spin" />
      <ImageOff v-else :size="18" />
    </span>
    <span v-if="failed" class="sr-only">Gambar gagal dimuat</span>
  </div>
</template>
