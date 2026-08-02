<script setup lang="ts">
import { ArrowLeft, Check, Clock3, CreditCard, ExternalLink, ShieldCheck } from '@lucide/vue'

withDefaults(defineProps<{ showBack?: boolean }>(), { showBack: true })
defineEmits<{ back: [] }>()

const auth = useAuthStore()
const billing = useBillingStore()

const subscription = computed(() => auth.subscription)
const plan = computed(() => subscription.value?.plan)
const isTrial = computed(() => subscription.value?.is_on_trial || subscription.value?.status === 'trial')

const priceLabel = computed(() => {
  if (!plan.value) return 'Harga belum tersedia'
  const amount = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: plan.value.currency || 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(plan.value.price))
  const interval = plan.value.invoice_interval === 'year' ? 'tahun' : 'bulan'
  return `${amount} / ${plan.value.invoice_period > 1 ? `${plan.value.invoice_period} ` : ''}${interval}`
})

const trialEndLabel = computed(() => {
  const value = subscription.value?.trial_ends_at
  if (!value) return ''
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  }).format(new Date(value))
})

async function payNow() {
  try {
    await billing.redirectToCheckout()
  } catch {
    // Pesan error ditampilkan dari store billing.
  }
}
</script>

<template>
  <section class="grid gap-6">
    <header>
      <button
        v-if="showBack"
        type="button"
        class="mb-4 inline-flex min-h-9 items-center gap-2 text-sm font-medium text-neutral-500 hover:text-neutral-900"
        @click="$emit('back')"
      >
        <ArrowLeft :size="16" />
        Kembali ke dashboard
      </button>
      <h1 class="text-2xl font-bold text-neutral-900 sm:text-3xl">Billing & subscription</h1>
      <p class="mt-2 text-sm text-neutral-500">Kelola paket dan aktifkan subscription melalui pembayaran aman Xendit.</p>
    </header>

    <div class="grid grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)] gap-5 max-lg:grid-cols-1">
      <article class="rounded-md border border-neutral-200 bg-neutral-0 p-6 shadow-card">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p class="text-xs font-bold uppercase tracking-wide text-primary-700">Paket saat ini</p>
            <h2 class="mt-2 text-2xl font-bold text-neutral-900">{{ plan?.name || 'Belum ada paket' }}</h2>
            <p class="mt-2 max-w-xl text-sm leading-6 text-neutral-500">{{ plan?.description || 'Data paket belum tersedia.' }}</p>
          </div>
          <span
            :class="[
              'rounded-full px-3 py-1.5 text-xs font-bold',
              subscription?.is_active ? 'bg-primary-50 text-primary-700' : 'bg-amber-50 text-amber-700',
            ]"
          >
            {{ isTrial ? 'Trial aktif' : subscription?.status === 'active' ? 'Aktif' : subscription?.status || 'Tidak aktif' }}
          </span>
        </div>

        <div class="mt-6 border-y border-neutral-200 py-5">
          <p class="text-sm text-neutral-500">Biaya subscription</p>
          <p class="mt-1 text-xl font-bold text-neutral-900">{{ priceLabel }}</p>
          <p v-if="isTrial && trialEndLabel" class="mt-2 flex items-center gap-2 text-sm font-medium text-amber-700">
            <Clock3 :size="16" /> Trial berlaku sampai {{ trialEndLabel }}
          </p>
        </div>

        <div v-if="plan?.features?.length" class="mt-5 grid grid-cols-2 gap-3 max-sm:grid-cols-1">
          <div v-for="feature in plan.features" :key="feature.slug" class="flex items-center gap-3 text-sm text-neutral-700">
            <span class="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary-50 text-primary-700">
              <Check :size="14" />
            </span>
            <span>{{ feature.name }}: <strong>{{ feature.value }}</strong></span>
          </div>
        </div>
      </article>

      <aside class="rounded-md border border-neutral-200 bg-neutral-0 p-6 shadow-card">
        <span class="grid h-11 w-11 place-items-center rounded-md bg-primary-50 text-primary-700">
          <CreditCard :size="21" />
        </span>
        <h2 class="mt-4 text-lg font-bold text-neutral-900">
          {{ isTrial ? 'Aktifkan sekarang' : 'Perpanjang subscription' }}
        </h2>
        <p class="mt-2 text-sm leading-6 text-neutral-500">
          Kamu akan diarahkan ke halaman pembayaran Xendit. Subscription baru aktif setelah pembayaran diverifikasi backend.
        </p>

        <div v-if="billing.error" class="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-danger-500">
          {{ billing.error }}
        </div>

        <AtomsAppButton class="mt-5 w-full" :disabled="billing.loading || !plan" @click="payNow">
          <span class="flex items-center gap-2">
            {{ billing.loading ? 'Membuat checkout...' : 'Bayar dengan Xendit' }}
            <ExternalLink v-if="!billing.loading" :size="16" />
          </span>
        </AtomsAppButton>

        <p class="mt-4 flex items-start gap-2 text-xs leading-5 text-neutral-500">
          <ShieldCheck :size="16" class="mt-0.5 shrink-0 text-primary-700" />
          Nominal berasal langsung dari backend. Sewantara tidak menyimpan detail metode pembayaranmu.
        </p>
      </aside>
    </div>
  </section>
</template>
