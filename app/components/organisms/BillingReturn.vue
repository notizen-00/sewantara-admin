<script setup lang="ts">
import { AlertCircle, CheckCircle2, Clock3, CreditCard, RotateCw, XCircle } from '@lucide/vue'

const props = defineProps<{ result: 'success' | 'cancel' }>()

const auth = useAuthStore()
const billing = useBillingStore()
const initialized = ref(false)

const displayState = computed(() => {
  if (billing.payment?.status === 'paid') return 'paid'
  if (billing.payment?.status === 'failed') return 'failed'
  if (props.result === 'cancel') return 'cancel'
  if (billing.polling || billing.payment?.status === 'pending') return 'pending'
  return 'unknown'
})

const content = computed(() => ({
  paid: {
    title: 'Subscription berhasil diaktifkan',
    description: 'Pembayaran sudah diverifikasi dan status subscription telah diperbarui.',
    icon: CheckCircle2,
    tone: 'text-primary-700 bg-primary-50',
  },
  pending: {
    title: 'Memverifikasi pembayaran',
    description: 'Kami menunggu konfirmasi resmi dari Xendit. Halaman ini akan diperbarui otomatis.',
    icon: Clock3,
    tone: 'text-amber-700 bg-amber-50',
  },
  failed: {
    title: 'Pembayaran belum berhasil',
    description: 'Payment Session tidak berhasil dibuat atau diproses. Silakan buat checkout baru.',
    icon: XCircle,
    tone: 'text-danger-500 bg-red-50',
  },
  cancel: {
    title: 'Pembayaran dibatalkan',
    description: 'Tidak ada pembayaran yang dikonfirmasi. Trial yang masih berlaku tidak terpengaruh.',
    icon: AlertCircle,
    tone: 'text-neutral-700 bg-neutral-100',
  },
  unknown: {
    title: 'Status pembayaran belum tersedia',
    description: 'Kami tidak menemukan transaksi yang perlu diperiksa pada browser ini.',
    icon: AlertCircle,
    tone: 'text-neutral-700 bg-neutral-100',
  },
}[displayState.value]))

async function initialize() {
  auth.hydrateFromStorage()
  if (!auth.isAuthenticated || !billing.pendingPaymentId()) {
    initialized.value = true
    return
  }

  try {
    if (props.result === 'success') {
      const payment = await billing.pollPayment()
      if (payment?.status === 'paid') await auth.fetchSession()
    } else {
      await billing.fetchPayment()
    }
  } catch {
    // Pesan error berasal dari store billing.
  } finally {
    initialized.value = true
  }
}

async function retryCheckout() {
  try {
    await billing.redirectToCheckout()
  } catch {
    // Pesan error berasal dari store billing.
  }
}

onMounted(initialize)
onUnmounted(billing.stopPolling)
</script>

<template>
  <TemplatesAuthLayout>
    <div class="mb-6 flex justify-center"><MoleculesBrandLockup /></div>
    <section class="w-full max-w-lg rounded-lg border border-neutral-200 bg-neutral-0 p-7 text-center shadow-card">
      <span :class="['mx-auto grid h-14 w-14 place-items-center rounded-full', content.tone]">
        <component :is="content.icon" :size="27" :class="{ 'animate-pulse': displayState === 'pending' }" />
      </span>
      <h1 class="mt-5 text-2xl font-bold text-neutral-900">{{ content.title }}</h1>
      <p class="mt-2 text-sm leading-6 text-neutral-500">{{ content.description }}</p>

      <div v-if="billing.payment" class="mt-6 rounded-md border border-neutral-200 bg-neutral-50 p-4 text-left text-sm">
        <div class="flex justify-between gap-4"><span class="text-neutral-500">Nomor</span><strong class="text-neutral-900">{{ billing.payment.payment_number }}</strong></div>
        <div class="mt-2 flex justify-between gap-4"><span class="text-neutral-500">Nominal</span><strong class="text-neutral-900">{{ new Intl.NumberFormat('id-ID', { style: 'currency', currency: billing.payment.currency, maximumFractionDigits: 0 }).format(Number(billing.payment.amount)) }}</strong></div>
        <div class="mt-2 flex justify-between gap-4"><span class="text-neutral-500">Status</span><strong class="capitalize text-neutral-900">{{ billing.payment.status }}</strong></div>
      </div>

      <p v-if="billing.error" class="mt-4 text-sm text-danger-500">{{ billing.error }}</p>

      <div class="mt-6 grid gap-3">
        <NuxtLink v-if="auth.isAuthenticated" to="/" class="inline-flex min-h-11 items-center justify-center rounded-md bg-primary-600 px-4 text-sm font-semibold text-white hover:bg-primary-700">
          Kembali ke dashboard
        </NuxtLink>
        <AtomsAppButton v-if="['failed', 'cancel'].includes(displayState) && auth.isAuthenticated" variant="secondary" :disabled="billing.loading" @click="retryCheckout">
          <span class="flex items-center gap-2"><CreditCard :size="16" />{{ billing.loading ? 'Membuat checkout...' : 'Coba bayar lagi' }}</span>
        </AtomsAppButton>
        <AtomsAppButton v-if="displayState === 'pending' && initialized" variant="secondary" :disabled="billing.polling" @click="initialize">
          <span class="flex items-center gap-2"><RotateCw :size="16" />Periksa lagi</span>
        </AtomsAppButton>
        <NuxtLink v-if="!auth.isAuthenticated" to="/" class="text-sm font-semibold text-primary-700">Masuk ke akun</NuxtLink>
      </div>
    </section>
  </TemplatesAuthLayout>
</template>
