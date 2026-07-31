<script setup lang="ts">
import type { MitraDashboardPresenter } from '~/application/mitra/useMitraDashboard'

defineProps<{
  dashboard: MitraDashboardPresenter
}>()
</script>

<template>
  <section>
    <div class="mb-6 flex justify-center">
      <MoleculesBrandLockup />
    </div>

    <div class="rounded-lg border border-neutral-200 bg-neutral-0 p-6 shadow-card">
      <div class="mb-6 text-center">
        <h2 class="text-2xl font-bold text-neutral-900">
          {{ dashboard.activeAuthTab === 'login' ? 'Masuk ke Sewantara' : 'Buat akun mitra' }}
        </h2>
        <p class="mt-2 text-sm leading-6 text-neutral-500">
          {{
            dashboard.activeAuthTab === 'login'
              ? 'Gunakan akun owner untuk mengakses workspace bisnis Anda.'
              : 'Daftarkan bisnis dan owner utama untuk memulai onboarding.'
          }}
        </p>
      </div>

      <MoleculesSegmentedControl
        v-model="dashboard.activeAuthTab"
        :options="[
          { label: 'Login', value: 'login' },
          { label: 'Register', value: 'register' },
        ]"
      />

      <form v-if="dashboard.activeAuthTab === 'login'" class="mt-5 grid gap-4" @submit.prevent="dashboard.submitLogin">
        <AtomsAppInput v-model="dashboard.loginForm.email" label="Email owner" type="email" autocomplete="email" required />
        <AtomsAppInput
          v-model="dashboard.loginForm.password"
          label="Password"
          type="password"
          autocomplete="current-password"
          required
        />
        <AtomsAppButton type="submit" :disabled="dashboard.auth.loading">
          {{ dashboard.auth.loading ? 'Memproses...' : 'Masuk dashboard' }}
        </AtomsAppButton>
      </form>

      <form v-else class="mt-5 grid gap-4" @submit.prevent="dashboard.submitRegister">
        <div class="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
          <AtomsAppInput v-model="dashboard.registerForm.business_name" label="Nama usaha" required :maxlength="150" />
          <AtomsAppInput
            v-model="dashboard.registerForm.subdomain"
            label="Subdomain"
            required
            pattern="[a-z0-9-]{3,63}"
          />
        </div>

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

        <div class="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
          <AtomsAppInput v-model="dashboard.registerForm.owner.name" label="Nama owner" required />
          <AtomsAppInput v-model="dashboard.registerForm.owner.phone" label="Telepon" required />
        </div>

        <AtomsAppInput v-model="dashboard.registerForm.owner.email" label="Email owner" type="email" required />

        <div class="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
          <AtomsAppInput v-model="dashboard.registerForm.owner.password" label="Password" type="password" required :minlength="8" />
          <AtomsAppInput
            v-model="dashboard.registerForm.owner.password_confirmation"
            label="Konfirmasi"
            type="password"
            required
            :minlength="8"
          />
        </div>

        <AtomsAppCheckbox v-model="dashboard.registerForm.terms_accepted" label="Saya menyetujui syarat penggunaan Sewantara." required />

        <AtomsAppButton type="submit" :disabled="dashboard.auth.loading">
          {{ dashboard.auth.loading ? 'Mendaftarkan...' : 'Buat akun mitra' }}
        </AtomsAppButton>
      </form>
    </div>
  </section>
</template>
