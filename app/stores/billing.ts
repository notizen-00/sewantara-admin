import { defineStore } from 'pinia'
import type { SubscriptionPayment } from '~/domain/mitra'
import { useBillingRepository } from '~/infrastructure/repositories/billingRepository'

const pendingPaymentKey = 'sewantara.subscription_payment_id'

export const useBillingStore = defineStore('billing', () => {
  const payment = ref<SubscriptionPayment | null>(null)
  const loading = ref(false)
  const polling = ref(false)
  const error = ref('')
  let pollGeneration = 0

  const isPaid = computed(() => payment.value?.status === 'paid')
  const isPending = computed(() => payment.value?.status === 'pending')

  function rememberPayment(paymentId: string) {
    if (process.client) localStorage.setItem(pendingPaymentKey, paymentId)
  }

  function pendingPaymentId() {
    if (!process.client) return ''
    return localStorage.getItem(pendingPaymentKey) || ''
  }

  function clearPendingPayment() {
    if (process.client) localStorage.removeItem(pendingPaymentKey)
  }

  async function createCheckout() {
    if (loading.value) return null

    loading.value = true
    error.value = ''
    try {
      const response = await useBillingRepository().checkout()
      payment.value = response.data.payment
      rememberPayment(response.data.payment.id)
      return response.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Checkout pembayaran gagal dibuat.'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function redirectToCheckout() {
    const checkout = await createCheckout()
    if (checkout && process.client) window.location.assign(checkout.checkout.redirect_url)
    return checkout
  }

  async function fetchPayment(paymentId = pendingPaymentId()) {
    if (!paymentId) return null

    error.value = ''
    try {
      const response = await useBillingRepository().payment(paymentId)
      payment.value = response.data.payment
      if (response.data.payment.status === 'paid') clearPendingPayment()
      return response.data.payment
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Status pembayaran gagal dimuat.'
      throw err
    }
  }

  function stopPolling() {
    pollGeneration += 1
    polling.value = false
  }

  async function pollPayment(options: { timeoutMs?: number; intervalMs?: number } = {}) {
    const paymentId = pendingPaymentId()
    if (!paymentId) return null

    const timeoutMs = options.timeoutMs ?? 120_000
    const intervalMs = options.intervalMs ?? 2_500
    const startedAt = Date.now()
    const generation = ++pollGeneration
    polling.value = true

    try {
      while (generation === pollGeneration && Date.now() - startedAt < timeoutMs) {
        const current = await fetchPayment(paymentId)
        if (!current || current.status !== 'pending') return current
        await new Promise((resolve) => setTimeout(resolve, intervalMs))
      }
      return payment.value
    } finally {
      if (generation === pollGeneration) polling.value = false
    }
  }

  return {
    payment,
    loading,
    polling,
    error,
    isPaid,
    isPending,
    pendingPaymentId,
    clearPendingPayment,
    createCheckout,
    redirectToCheckout,
    fetchPayment,
    pollPayment,
    stopPolling,
  }
})
