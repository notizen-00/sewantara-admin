<script setup lang="ts">
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Building2,
  Check,
  LockKeyhole,
  Sparkles,
} from '@lucide/vue'
import type { MitraDashboardPresenter } from '~/application/mitra/useMitraDashboard'
import { resolveApiBaseUrl } from '~/composables/useApiClient'

defineProps<{
  dashboard: MitraDashboardPresenter
}>()

const config = useRuntimeConfig()

const benefits = [
  'Kelola cabang dan operasional dalam satu workspace',
  'Pantau performa bisnis secara real-time',
  'Aktivasi cepat dengan panduan langkah demi langkah',
]

function connectWithGoogle() {
  if (!process.client) return

  const apiBaseUrl = resolveApiBaseUrl(config.public.apiBase)
  const googleAuthUrl = new URL(`${apiBaseUrl}/central/auth/google/redirect`)
  googleAuthUrl.searchParams.set('device_name', 'nuxt-web')
  window.location.assign(googleAuthUrl.toString())
}
</script>

<template>
  <section class="overflow-hidden rounded-[28px] border border-white/80 bg-white shadow-[0_30px_90px_rgba(76,5,25,0.14)] ring-1 ring-neutral-900/[0.04]">
    <div class="grid lg:grid-cols-[0.86fr_1.14fr]">
      <aside class="relative hidden min-h-[760px] overflow-hidden bg-neutral-900 px-10 py-11 text-white lg:flex lg:flex-col">
        <div class="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary-600/40 blur-3xl"></div>
        <div class="absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-primary-800/50 blur-3xl"></div>
        <div class="absolute inset-0 opacity-[0.055] [background-image:radial-gradient(circle_at_center,white_1px,transparent_1px)] [background-size:22px_22px]"></div>

        <div class="relative z-10">
          <MoleculesBrandLockup tone="dark" />
        </div>

        <div class="relative z-10 my-auto py-14">
          <span class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-3 py-1.5 text-xs font-semibold text-primary-100 backdrop-blur">
            <Sparkles :size="14" />
            Workspace bisnis generasi baru
          </span>
          <h1 class="mt-6 max-w-sm text-[2.55rem] font-bold leading-[1.12] tracking-[-0.04em]">
            Operasional lebih rapi. Bisnis tumbuh lebih pasti.
          </h1>
          <p class="mt-5 max-w-sm text-sm leading-7 text-neutral-400">
            Satu pusat kendali untuk mengelola transaksi, inventaris, pelanggan, dan performa seluruh cabang Anda.
          </p>

          <ul class="mt-9 grid gap-4">
            <li v-for="benefit in benefits" :key="benefit" class="flex items-start gap-3 text-sm leading-6 text-neutral-200">
              <span class="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary-600/20 text-primary-100 ring-1 ring-primary-500/30">
                <Check :size="14" :stroke-width="2.5" />
              </span>
              {{ benefit }}
            </li>
          </ul>
        </div>

        <div class="relative z-10 grid grid-cols-3 gap-3">
          <div class="rounded-2xl border border-white/10 bg-white/[0.06] p-3 backdrop-blur">
            <Building2 :size="18" class="text-primary-100" />
            <p class="mt-3 text-xs font-semibold text-white">Multi-cabang</p>
          </div>
          <div class="rounded-2xl border border-white/10 bg-white/[0.06] p-3 backdrop-blur">
            <BarChart3 :size="18" class="text-primary-100" />
            <p class="mt-3 text-xs font-semibold text-white">Insight live</p>
          </div>
          <div class="rounded-2xl border border-white/10 bg-white/[0.06] p-3 backdrop-blur">
            <BadgeCheck :size="18" class="text-primary-100" />
            <p class="mt-3 text-xs font-semibold text-white">Data aman</p>
          </div>
        </div>
      </aside>

      <div class="relative px-5 py-6 sm:px-10 sm:py-10 lg:px-12 lg:py-11">
        <div class="mb-8 flex items-center justify-between lg:hidden">
          <MoleculesBrandLockup />
          <span class="rounded-full bg-primary-50 px-3 py-1.5 text-[11px] font-bold text-primary-700">MITRA</span>
        </div>

        <div class="mx-auto max-w-[610px]">
          <div class="flex items-start justify-between gap-5">
            <div>
              <p class="text-xs font-bold uppercase tracking-[0.16em] text-primary-600">
                {{ dashboard.activeAuthTab === 'login' ? 'Selamat datang kembali' : 'Mulai perjalanan Anda' }}
              </p>
              <h2 class="mt-2 text-3xl font-bold tracking-[-0.035em] text-neutral-900 sm:text-[2rem]">
                {{ dashboard.activeAuthTab === 'login' ? 'Masuk ke Sewantara' : 'Buat akun mitra' }}
              </h2>
              <p class="mt-2 text-sm leading-6 text-neutral-500">
                {{
                  dashboard.activeAuthTab === 'login'
                    ? 'Akses workspace dan lanjutkan pengelolaan bisnis Anda.'
                    : 'Siapkan workspace bisnis Anda hanya dalam beberapa langkah.'
                }}
              </p>
            </div>
            <span class="hidden h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary-50 text-primary-700 sm:grid">
              <LockKeyhole :size="20" />
            </span>
          </div>

          <div class="mt-7">
            <MoleculesSegmentedControl
              v-model="dashboard.activeAuthTab"
              :options="[
                { label: 'Login', value: 'login' },
                { label: 'Register', value: 'register' },
              ]"
            />
          </div>

          <button
            type="button"
            class="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 text-sm font-semibold text-neutral-700 shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition hover:-translate-y-0.5 hover:border-neutral-400 hover:shadow-[0_8px_24px_rgba(23,23,23,0.08)] focus:outline-none focus:ring-4 focus:ring-neutral-100"
            @click="connectWithGoogle"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" class="h-5 w-5">
              <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.02v2.55h3.24c1.9-1.75 2.98-4.33 2.98-7.42Z" />
              <path fill="#34A853" d="M12 22c2.7 0 4.98-.9 6.63-2.42l-3.24-2.55c-.9.6-2.05.97-3.39.97-2.6 0-4.81-1.76-5.6-4.12H3.05v2.63A10 10 0 0 0 12 22Z" />
              <path fill="#FBBC05" d="M6.4 13.88A6 6 0 0 1 6.08 12c0-.65.11-1.28.31-1.88V7.49H3.05A10 10 0 0 0 2 12c0 1.61.38 3.14 1.05 4.51l3.35-2.63Z" />
              <path fill="#EA4335" d="M12 6c1.47 0 2.8.51 3.84 1.5l2.87-2.88A9.63 9.63 0 0 0 12 2a10 10 0 0 0-8.95 5.49l3.35 2.63C7.19 7.76 9.4 6 12 6Z" />
            </svg>
            {{ dashboard.activeAuthTab === 'login' ? 'Lanjutkan dengan Google' : 'Daftar dengan Google' }}
          </button>

          <div class="my-5 flex items-center gap-4" aria-hidden="true">
            <span class="h-px flex-1 bg-neutral-200"></span>
            <span class="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-400">atau gunakan email</span>
            <span class="h-px flex-1 bg-neutral-200"></span>
          </div>

          <form v-if="dashboard.activeAuthTab === 'login'" class="auth-fields grid gap-4" @submit.prevent="dashboard.submitLogin">
            <AtomsAppInput
              v-model="dashboard.loginForm.email"
              label="Email owner"
              type="email"
              autocomplete="email"
              placeholder="nama@bisnis.com"
              required
            />
            <AtomsAppInput
              v-model="dashboard.loginForm.password"
              label="Password"
              type="password"
              autocomplete="current-password"
              placeholder="Masukkan password"
              required
            />
            <AtomsAppButton type="submit" :disabled="dashboard.auth.loading" class="mt-2 min-h-12 rounded-xl shadow-[0_10px_24px_rgba(190,18,60,0.2)]">
              <span>{{ dashboard.auth.loading ? 'Memproses...' : 'Masuk ke dashboard' }}</span>
              <ArrowRight v-if="!dashboard.auth.loading" :size="17" class="ml-2" />
            </AtomsAppButton>
          </form>

          <form v-else class="auth-fields grid gap-5" @submit.prevent="dashboard.submitRegister">
            <div>
              <p class="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-neutral-400">Informasi bisnis</p>
              <div class="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
                <AtomsAppInput v-model="dashboard.registerForm.business_name" label="Nama usaha" placeholder="Contoh: Sewantara Rental" required :maxlength="150" />
                <AtomsAppInput
                  v-model="dashboard.registerForm.subdomain"
                  label="Subdomain"
                  placeholder="nama-usaha"
                  required
                  pattern="[a-z0-9-]{3,63}"
                />
              </div>
            </div>

            <fieldset class="grid gap-3">
              <legend class="mb-1 text-sm font-semibold text-neutral-900">Kapan ingin mulai berlangganan?</legend>
              <div class="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
                <button
                  type="button"
                  :class="[
                    'relative rounded-xl border p-4 text-left transition hover:-translate-y-0.5',
                    dashboard.registrationBillingChoice === 'trial'
                      ? 'border-primary-600 bg-primary-50/70 ring-1 ring-primary-600'
                      : 'border-neutral-200 bg-white hover:border-neutral-400 hover:shadow-card',
                  ]"
                  @click="dashboard.registrationBillingChoice = 'trial'"
                >
                  <span v-if="dashboard.registrationBillingChoice === 'trial'" class="absolute right-3 top-3 grid h-5 w-5 place-items-center rounded-full bg-primary-600 text-white">
                    <Check :size="12" :stroke-width="3" />
                  </span>
                  <span class="text-sm font-bold text-neutral-900">Mulai trial gratis</span>
                  <span class="mt-1 block pr-4 text-xs leading-5 text-neutral-500">
                    Tanpa pembayaran selama {{ dashboard.selectedRegistrationPlan?.trial_period || 0 }}
                    {{ dashboard.selectedRegistrationPlan?.trial_interval === 'day' ? 'hari' : dashboard.selectedRegistrationPlan?.trial_interval || 'hari' }}.
                  </span>
                </button>
                <button
                  type="button"
                  :class="[
                    'relative rounded-xl border p-4 text-left transition hover:-translate-y-0.5',
                    dashboard.registrationBillingChoice === 'pay_now'
                      ? 'border-primary-600 bg-primary-50/70 ring-1 ring-primary-600'
                      : 'border-neutral-200 bg-white hover:border-neutral-400 hover:shadow-card',
                  ]"
                  @click="dashboard.registrationBillingChoice = 'pay_now'"
                >
                  <span v-if="dashboard.registrationBillingChoice === 'pay_now'" class="absolute right-3 top-3 grid h-5 w-5 place-items-center rounded-full bg-primary-600 text-white">
                    <Check :size="12" :stroke-width="3" />
                  </span>
                  <span class="text-sm font-bold text-neutral-900">Aktifkan sekarang</span>
                  <span class="mt-1 block pr-4 text-xs leading-5 text-neutral-500">Aktifkan paket setelah pendaftaran selesai.</span>
                </button>
              </div>
            </fieldset>

            <div class="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
              <AtomsAppSelect
                v-model="dashboard.registerForm.business_type"
                label="Template bisnis"
                required
                :options="dashboard.catalog.templates.map((template) => ({ label: template.name, value: template.code }))"
              />
              <AtomsAppSelect
                v-model="dashboard.registerForm.plan_id"
                label="Paket"
                required
                :options="
                  dashboard.catalog.monthlyPlans.map((plan) => ({
                    label: `${plan.name} - ${dashboard.formatCurrency(Number(plan.price))}`,
                    value: plan.id,
                  }))
                "
              />
            </div>

            <div class="border-t border-neutral-100 pt-5">
              <p class="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-neutral-400">Data pemilik</p>
              <div class="grid gap-4">
                <div class="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
                  <AtomsAppInput v-model="dashboard.registerForm.owner.name" label="Nama owner" placeholder="Nama lengkap" required />
                  <AtomsAppInput v-model="dashboard.registerForm.owner.phone" label="Telepon" placeholder="08xxxxxxxxxx" required />
                </div>

                <AtomsAppInput v-model="dashboard.registerForm.owner.email" label="Email owner" type="email" placeholder="nama@bisnis.com" required />

                <div class="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
                  <AtomsAppInput v-model="dashboard.registerForm.owner.password" label="Password" type="password" placeholder="Minimal 8 karakter" required :minlength="8" />
                  <AtomsAppInput
                    v-model="dashboard.registerForm.owner.password_confirmation"
                    label="Konfirmasi password"
                    type="password"
                    placeholder="Ulangi password"
                    required
                    :minlength="8"
                  />
                </div>
              </div>
            </div>

            <AtomsAppCheckbox v-model="dashboard.registerForm.terms_accepted" label="Saya menyetujui syarat penggunaan dan kebijakan privasi Sewantara." required />

            <AtomsAppButton type="submit" :disabled="dashboard.auth.loading || dashboard.billing.loading" class="min-h-12 rounded-xl shadow-[0_10px_24px_rgba(190,18,60,0.2)]">
              <span>
                {{
                  dashboard.auth.loading || dashboard.billing.loading
                    ? 'Memproses...'
                    : dashboard.registrationBillingChoice === 'pay_now'
                      ? 'Buat akun & lanjut bayar'
                      : 'Buat akun & mulai trial'
                }}
              </span>
              <ArrowRight v-if="!dashboard.auth.loading && !dashboard.billing.loading" :size="17" class="ml-2" />
            </AtomsAppButton>
          </form>

          <div class="mt-7 flex items-center justify-center gap-2 border-t border-neutral-100 pt-5 text-center text-xs text-neutral-400">
            <LockKeyhole :size="13" />
            Data Anda dienkripsi dan tersimpan dengan aman
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.auth-fields :deep(label) {
  font-weight: 600;
}

.auth-fields :deep(input:not([type='checkbox'])),
.auth-fields :deep(select) {
  min-height: 3rem;
  border-radius: 0.75rem;
  padding-inline: 0.875rem;
}

.auth-fields :deep(input:not([type='checkbox'])):hover,
.auth-fields :deep(select):hover {
  border-color: #a3a3a3;
}

.auth-fields :deep(input::placeholder) {
  color: #a3a3a3;
  font-weight: 400;
}
</style>
