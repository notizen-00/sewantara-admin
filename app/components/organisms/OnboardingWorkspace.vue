<script setup lang="ts">
import type { MitraDashboardPresenter } from '~/application/mitra/useMitraDashboard'

defineProps<{
  dashboard: MitraDashboardPresenter
}>()

const operatingDays = [
  { key: 'monday', label: 'Senin' },
  { key: 'tuesday', label: 'Selasa' },
  { key: 'wednesday', label: 'Rabu' },
  { key: 'thursday', label: 'Kamis' },
  { key: 'friday', label: 'Jumat' },
  { key: 'saturday', label: 'Sabtu' },
  { key: 'sunday', label: 'Minggu' },
] as const
</script>

<template>
  <section id="onboarding" class="grid gap-5">
    <div class="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-200 pb-4">
      <div>
        <p class="text-sm font-semibold text-neutral-900">{{ dashboard.selectedStepLabel }}</p>
        <p class="mt-1 text-sm text-neutral-500">Tahap aktif dari penyiapan workspace {{ dashboard.tenantName }}.</p>
      </div>
      <AtomsStatusBadge :label="`${dashboard.onboarding.completion}% selesai`" />
    </div>

    <MoleculesFormSection
      v-if="dashboard.selectedOnboardingStep === 'business'"
      eyebrow="Tahap 1"
      title="Informasi usaha"
      description="Lengkapi identitas workspace, cabang utama, dan jam operasional bisnis."
    >
      <form class="grid gap-6" @submit.prevent="dashboard.continueSetup">
        <div class="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
          <AtomsAppInput v-model="dashboard.businessForm.business_name" label="Nama usaha" required />
          <AtomsAppInput v-model="dashboard.businessForm.branch_name" label="Nama cabang utama" required />
          <AtomsAppInput v-model="dashboard.businessForm.timezone" label="Zona waktu" required />
          <AtomsAppInput v-model="dashboard.businessForm.currency" label="Mata uang" required />
        </div>

        <div class="border-t border-neutral-200 pt-5">
          <h4 class="text-sm font-semibold text-neutral-900">Jadwal operasional</h4>
          <div class="mt-4 grid gap-3">
            <div
              v-for="day in operatingDays"
              :key="day.key"
              class="grid grid-cols-[120px_minmax(0,1fr)_minmax(0,1fr)_96px] items-end gap-3 max-sm:grid-cols-2"
            >
              <p class="self-center text-sm font-medium text-neutral-700">{{ day.label }}</p>
              <AtomsAppInput
                v-model="dashboard.businessForm.operating_hours[day.key].open"
                label="Buka"
                type="time"
                :disabled="dashboard.businessForm.operating_hours[day.key].closed"
              />
              <AtomsAppInput
                v-model="dashboard.businessForm.operating_hours[day.key].close"
                label="Tutup"
                type="time"
                :disabled="dashboard.businessForm.operating_hours[day.key].closed"
              />
              <div class="pb-3">
                <AtomsAppCheckbox
                  v-model="dashboard.businessForm.operating_hours[day.key].closed"
                  label="Libur"
                />
              </div>
            </div>
          </div>
        </div>
      </form>
    </MoleculesFormSection>

    <MoleculesFormSection
      v-else-if="dashboard.selectedOnboardingStep === 'rental'"
      eyebrow="Tahap 2"
      title="Model penyewaan"
      description="Tentukan cara pelanggan memesan dan bagaimana sistem mengalokasikan unit."
    >
      <form class="grid gap-5" @submit.prevent="dashboard.continueSetup">
        <div class="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
          <AtomsAppSelect
            v-model="dashboard.rentalForm.rental_model"
            label="Model penyewaan"
            :options="[
              { label: 'Per hari', value: 'per_day' },
              { label: 'Per jam', value: 'per_hour' },
              { label: 'Per sesi', value: 'session' },
            ]"
          />
          <AtomsAppSelect
            v-model="dashboard.rentalForm.booking_strategy"
            label="Strategi booking"
            :options="[
              { label: 'Rentang tanggal', value: 'date_range' },
              { label: 'Antrean', value: 'queue' },
              { label: 'Sesi', value: 'session' },
            ]"
          />
          <AtomsAppSelect
            v-model="dashboard.rentalForm.allocation_strategy"
            label="Alokasi unit"
            :options="[
              { label: 'Otomatis', value: 'auto_assign' },
              { label: 'Manual', value: 'manual' },
            ]"
          />
          <AtomsAppInput
            v-if="dashboard.rentalForm.booking_strategy !== 'date_range'"
            v-model="dashboard.rentalForm.slot_duration_minutes"
            label="Durasi slot (menit)"
            type="number"
            :min="1"
            required
          />
        </div>

        <div class="grid grid-cols-3 gap-3 max-sm:grid-cols-1">
          <div class="rounded-md border border-neutral-200 bg-neutral-50 p-4">
            <AtomsAppCheckbox v-model="dashboard.rentalForm.enable_waiting_list" label="Waiting list" />
          </div>
          <div class="rounded-md border border-neutral-200 bg-neutral-50 p-4">
            <AtomsAppCheckbox v-model="dashboard.rentalForm.allow_extend_booking" label="Perpanjang booking" />
          </div>
          <div class="rounded-md border border-neutral-200 bg-neutral-50 p-4">
            <AtomsAppCheckbox v-model="dashboard.rentalForm.realtime_availability" label="Stok real-time" />
          </div>
        </div>
      </form>
    </MoleculesFormSection>

    <MoleculesFormSection
      v-else-if="dashboard.selectedOnboardingStep === 'inventory'"
      eyebrow="Tahap 3"
      title="Resource dan unit"
      description="Backend akan memverifikasi minimal satu unit serialized atau stok quantity pada cabang aktif."
    >
      <div class="rounded-md border border-neutral-200 bg-neutral-50 p-5">
        <p class="text-sm font-semibold text-neutral-900">Status inventory</p>
        <p class="mt-2 text-sm leading-6 text-neutral-500">
          Tambahkan kategori, produk, lalu unit atau stok melalui modul inventory. Setelah datanya tersedia, lanjutkan untuk menjalankan verifikasi.
        </p>
      </div>
    </MoleculesFormSection>

    <MoleculesFormSection
      v-else-if="dashboard.selectedOnboardingStep === 'pricing'"
      eyebrow="Tahap 4"
      title="Harga penyewaan"
      description="Harga aktif harus kompatibel dengan model rental yang dipilih pada tahap sebelumnya."
    >
      <div class="rounded-md border border-neutral-200 bg-neutral-50 p-5">
        <p class="text-sm font-semibold text-neutral-900">Status harga</p>
        <p class="mt-2 text-sm leading-6 text-neutral-500">
          Pastikan minimal satu produk memiliki harga aktif. Sistem akan memeriksa tipe hourly, daily, atau event sesuai konfigurasi rental.
        </p>
      </div>
    </MoleculesFormSection>

    <MoleculesFormSection
      v-else-if="dashboard.selectedOnboardingStep === 'booking'"
      eyebrow="Tahap 5"
      title="Pengaturan booking"
      description="Atur kanal pemesanan, alokasi unit, pengingat, dan pembatalan transaksi yang belum dibayar."
    >
      <form class="grid gap-5" @submit.prevent="dashboard.continueSetup">
        <div class="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
          <div class="rounded-md border border-neutral-200 bg-neutral-50 p-4">
            <AtomsAppCheckbox v-model="dashboard.bookingForm.allow_online_booking" label="Booking online" />
          </div>
          <div class="rounded-md border border-neutral-200 bg-neutral-50 p-4">
            <AtomsAppCheckbox v-model="dashboard.bookingForm.allow_walk_in" label="Walk-in" />
          </div>
          <div class="rounded-md border border-neutral-200 bg-neutral-50 p-4">
            <AtomsAppCheckbox v-model="dashboard.bookingForm.enable_waiting_list" label="Waiting list" />
          </div>
          <div class="rounded-md border border-neutral-200 bg-neutral-50 p-4">
            <AtomsAppCheckbox v-model="dashboard.bookingForm.auto_reminder" label="Pengingat otomatis" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
          <AtomsAppSelect
            v-model="dashboard.bookingForm.allocation_strategy"
            label="Alokasi unit"
            :options="[
              { label: 'Otomatis', value: 'auto_assign' },
              { label: 'Manual', value: 'manual' },
            ]"
          />
          <AtomsAppInput
            v-model="dashboard.bookingForm.auto_cancel_minutes"
            label="Batalkan transaksi belum dibayar (menit)"
            type="number"
            :min="5"
            :disabled="!dashboard.bookingForm.auto_cancel_unpaid"
          />
        </div>
        <AtomsAppCheckbox v-model="dashboard.bookingForm.auto_cancel_unpaid" label="Aktifkan pembatalan otomatis" />
      </form>
    </MoleculesFormSection>

    <MoleculesFormSection
      v-else-if="dashboard.selectedOnboardingStep === 'payment'"
      eyebrow="Tahap 6"
      title="Metode pembayaran"
      description="Aktifkan minimal satu metode pembayaran untuk transaksi tenant."
    >
      <form class="grid gap-5" @submit.prevent="dashboard.continueSetup">
        <div class="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
          <div class="rounded-md border border-neutral-200 bg-neutral-50 p-4">
            <AtomsAppCheckbox v-model="dashboard.paymentsForm.methods[0].is_enabled" label="Tunai" />
          </div>
          <div class="rounded-md border border-neutral-200 bg-neutral-50 p-4">
            <AtomsAppCheckbox v-model="dashboard.paymentsForm.methods[1].is_enabled" label="Transfer bank manual" />
          </div>
        </div>

        <div v-if="dashboard.paymentsForm.methods[1].is_enabled" class="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
          <AtomsAppInput v-model="dashboard.transferPaymentConfig.bank_name" label="Bank" required />
          <AtomsAppInput v-model="dashboard.transferPaymentConfig.account_number" label="Nomor rekening" required />
          <div class="col-span-2 max-sm:col-span-1">
            <AtomsAppInput v-model="dashboard.transferPaymentConfig.account_name" label="Nama pemilik rekening" required />
          </div>
        </div>
      </form>
    </MoleculesFormSection>

    <MoleculesFormSection
      v-else
      eyebrow="Tahap 7"
      title="Review dan aktivasi"
      description="Periksa checklist backend sebelum mengaktifkan workspace tenant."
    >
      <div class="grid grid-cols-3 gap-3 max-sm:grid-cols-1">
        <div
          v-for="item in dashboard.onboarding.checklistItems"
          :key="item.key"
          class="rounded-md border border-neutral-200 bg-neutral-50 p-4"
        >
          <p class="text-sm font-semibold text-neutral-900">{{ item.label }}</p>
          <p :class="['mt-1 text-xs font-medium', item.done ? 'text-primary-700' : 'text-neutral-500']">
            {{ item.done ? 'Selesai' : 'Perlu dilengkapi' }}
          </p>
        </div>
      </div>
    </MoleculesFormSection>
  </section>
</template>
