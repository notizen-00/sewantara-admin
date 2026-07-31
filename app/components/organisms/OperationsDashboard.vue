<script setup lang="ts">
import {
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  BookOpenCheck,
  Boxes,
  CalendarDays,
  CircleDollarSign,
  CircleHelp,
  PackageCheck,
  PackageOpen,
  RefreshCw,
  Settings,
  Tags,
  Users,
  WalletCards,
  Wrench,
} from '@lucide/vue'
import type { Component } from 'vue'

interface DashboardMetric {
  key: 'revenue' | 'bookings' | 'active_rentals' | 'available_units'
  label: string
  value: string
  raw: number
  caption: string
}

const props = defineProps<{
  section: string
  metrics: DashboardMetric[]
  loading?: boolean
  bookingCreateRequest?: number
}>()

defineEmits<{
  refresh: []
  navigate: [section: string]
}>()

const metricIcons: Record<DashboardMetric['key'], Component> = {
  revenue: WalletCards,
  bookings: BookOpenCheck,
  active_rentals: PackageCheck,
  available_units: Boxes,
}

const moduleContent: Record<string, { title: string; description: string; icon: Component }> = {
  bookings: {
    title: 'Booking',
    description: 'Daftar dan status transaksi penyewaan tenant.',
    icon: BookOpenCheck,
  },
  calendar: {
    title: 'Kalender rental',
    description: 'Jadwal pengambilan, pengembalian, dan ketersediaan unit.',
    icon: CalendarDays,
  },
  customers: {
    title: 'Pelanggan',
    description: 'Data pelanggan dan riwayat transaksi rental.',
    icon: Users,
  },
  inventory: {
    title: 'Inventory',
    description: 'Produk, unit serialized, dan stok pada cabang aktif.',
    icon: Boxes,
  },
  products: {
    title: 'Produk',
    description: 'Katalog produk dan kategori rental pada workspace.',
    icon: PackageOpen,
  },
  pricing: {
    title: 'Harga',
    description: 'Konfigurasi tarif rental untuk setiap produk.',
    icon: Tags,
  },
  maintenance: {
    title: 'Maintenance',
    description: 'Jadwal perawatan dan kondisi unit rental.',
    icon: Wrench,
  },
  reports: {
    title: 'Laporan',
    description: 'Ringkasan performa operasional dan pendapatan.',
    icon: BarChart3,
  },
  settings: {
    title: 'Pengaturan',
    description: 'Profil workspace, cabang, tim, dan preferensi operasional.',
    icon: Settings,
  },
  help: {
    title: 'Bantuan',
    description: 'Panduan penggunaan dan dukungan untuk workspace tenant.',
    icon: CircleHelp,
  },
}

const currentModule = computed(() => moduleContent[props.section] || moduleContent.bookings)
const metricByKey = computed(() => Object.fromEntries(props.metrics.map((metric) => [metric.key, metric.raw])))
const activeRentals = computed(() => Number(metricByKey.value.active_rentals || 0))
const availableUnits = computed(() => Number(metricByKey.value.available_units || 0))
const recordedBookings = computed(() => Number(metricByKey.value.bookings || 0))

const currentDate = new Intl.DateTimeFormat('id-ID', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'Asia/Jakarta',
}).format(new Date())
</script>

<template>
  <section v-if="section === 'overview'" id="operations" class="grid gap-6">
    <header class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="text-sm font-medium text-neutral-500">{{ currentDate }}</p>
        <h1 class="mt-1 text-2xl font-bold text-neutral-900 sm:text-3xl">Ringkasan bisnis</h1>
        <p class="mt-2 text-sm text-neutral-500">Pantau kondisi rental dari laporan tenant terbaru.</p>
      </div>
      <button
        type="button"
        class="inline-flex min-h-10 items-center gap-2 rounded-sm border border-neutral-200 bg-neutral-0 px-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
        :disabled="loading"
        @click="$emit('refresh')"
      >
        <RefreshCw :size="16" :class="{ 'animate-spin': loading }" />
        {{ loading ? 'Memuat...' : 'Perbarui data' }}
      </button>
    </header>

    <div class="grid grid-cols-4 gap-4 max-xl:grid-cols-2 max-sm:grid-cols-1">
      <MoleculesMetricCard
        v-for="metric in metrics"
        :key="metric.key"
        :label="metric.label"
        :value="metric.value"
        :caption="metric.caption"
      >
        <template #icon>
          <component :is="metricIcons[metric.key]" :size="18" :stroke-width="1.8" />
        </template>
      </MoleculesMetricCard>
    </div>

    <div class="grid grid-cols-[minmax(0,1.45fr)_minmax(300px,0.75fr)] gap-5 max-lg:grid-cols-1">
      <section class="rounded-sm border border-neutral-200 bg-neutral-0 p-5 shadow-card">
        <div>
          <h2 class="text-base font-semibold text-neutral-900">Kondisi operasional</h2>
          <p class="mt-1 text-sm text-neutral-500">Angka terbaru dari laporan dashboard tenant.</p>
        </div>

        <div class="mt-5 divide-y divide-neutral-200 border-y border-neutral-200">
          <div class="flex min-h-16 items-center justify-between gap-4">
            <span class="flex items-center gap-3 text-sm font-medium text-neutral-700">
              <PackageCheck :size="18" class="text-neutral-500" />
              Rental aktif
            </span>
            <strong class="text-lg font-bold text-neutral-900">{{ activeRentals }}</strong>
          </div>
          <div class="flex min-h-16 items-center justify-between gap-4">
            <span class="flex items-center gap-3 text-sm font-medium text-neutral-700">
              <Boxes :size="18" class="text-neutral-500" />
              Unit tersedia
            </span>
            <strong class="text-lg font-bold text-neutral-900">{{ availableUnits }}</strong>
          </div>
          <div class="flex min-h-16 items-center justify-between gap-4">
            <span class="flex items-center gap-3 text-sm font-medium text-neutral-700">
              <BookOpenCheck :size="18" class="text-neutral-500" />
              Booking tercatat
            </span>
            <strong class="text-lg font-bold text-neutral-900">{{ recordedBookings }}</strong>
          </div>
        </div>
      </section>

      <section class="rounded-sm border border-neutral-200 bg-neutral-0 shadow-card">
        <div class="border-b border-neutral-200 px-5 py-4">
          <h2 class="text-base font-semibold text-neutral-900">Akses cepat</h2>
        </div>
        <div class="divide-y divide-neutral-200 px-2">
          <button
            type="button"
            class="flex min-h-14 w-full items-center justify-between gap-3 rounded-sm px-3 text-left hover:bg-neutral-50"
            @click="$emit('navigate', 'bookings')"
          >
            <span class="flex items-center gap-3 text-sm font-medium text-neutral-700">
              <BookOpenCheck :size="18" />
              Kelola booking
            </span>
            <ArrowUpRight :size="16" class="text-neutral-500" />
          </button>
          <button
            type="button"
            class="flex min-h-14 w-full items-center justify-between gap-3 rounded-sm px-3 text-left hover:bg-neutral-50"
            @click="$emit('navigate', 'products')"
          >
            <span class="flex items-center gap-3 text-sm font-medium text-neutral-700">
              <Boxes :size="18" />
              Kelola produk
            </span>
            <ArrowUpRight :size="16" class="text-neutral-500" />
          </button>
          <button
            type="button"
            class="flex min-h-14 w-full items-center justify-between gap-3 rounded-sm px-3 text-left hover:bg-neutral-50"
            @click="$emit('navigate', 'reports')"
          >
            <span class="flex items-center gap-3 text-sm font-medium text-neutral-700">
              <CircleDollarSign :size="18" />
              Buka laporan
            </span>
            <ArrowUpRight :size="16" class="text-neutral-500" />
          </button>
        </div>
      </section>
    </div>

    <section class="rounded-sm border border-neutral-200 bg-neutral-0 shadow-card">
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 px-5 py-4">
        <div>
          <h2 class="text-base font-semibold text-neutral-900">Agenda operasional</h2>
          <p class="mt-1 text-sm text-neutral-500">Pengambilan dan pengembalian unit terdekat.</p>
        </div>
        <button
          type="button"
          class="text-sm font-semibold text-primary-700 hover:text-primary-600"
          @click="$emit('navigate', 'calendar')"
        >
          Buka kalender
        </button>
      </div>
      <div class="grid min-h-44 place-items-center px-5 py-8 text-center">
        <div>
          <span class="mx-auto grid h-11 w-11 place-items-center rounded-full bg-neutral-100 text-neutral-500">
            <CalendarDays :size="20" />
          </span>
          <p class="mt-3 text-sm font-semibold text-neutral-900">Belum ada agenda yang dimuat</p>
          <p class="mt-1 text-xs text-neutral-500">Jadwal pengambilan dan pengembalian akan muncul di sini.</p>
        </div>
      </div>
    </section>
  </section>

  <OrganismsSettingsWorkspace
    v-else-if="section === 'settings'"
    @back="$emit('navigate', 'overview')"
  />

  <OrganismsBookingWorkspace
    v-else-if="section === 'bookings'"
    :create-request="bookingCreateRequest"
    @back="$emit('navigate', 'overview')"
  />

  <OrganismsProductWorkspace
    v-else-if="section === 'products'"
    @back="$emit('navigate', 'overview')"
  />

  <OrganismsInventoryWorkspace
    v-else-if="section === 'inventory'"
    @back="$emit('navigate', 'overview')"
  />

  <section v-else class="grid gap-6">
    <header>
      <button
        type="button"
        class="mb-4 inline-flex min-h-9 items-center gap-2 rounded-sm text-sm font-medium text-neutral-500 hover:text-neutral-900"
        @click="$emit('navigate', 'overview')"
      >
        <ArrowLeft :size="16" />
        Kembali ke ringkasan
      </button>
      <h1 class="text-2xl font-bold text-neutral-900 sm:text-3xl">{{ currentModule.title }}</h1>
      <p class="mt-2 text-sm text-neutral-500">{{ currentModule.description }}</p>
    </header>

    <div class="grid min-h-[420px] place-items-center rounded-sm border border-neutral-200 bg-neutral-0 px-6 py-12 text-center shadow-card">
      <div class="max-w-sm">
        <span class="mx-auto grid h-12 w-12 place-items-center rounded-sm bg-neutral-100 text-neutral-700">
          <component :is="currentModule.icon" :size="22" />
        </span>
        <h2 class="mt-4 text-base font-semibold text-neutral-900">Belum ada data untuk ditampilkan</h2>
        <p class="mt-2 text-sm leading-6 text-neutral-500">
          Data {{ currentModule.title.toLowerCase() }} untuk cabang aktif akan muncul di sini.
        </p>
      </div>
    </div>
  </section>
</template>
