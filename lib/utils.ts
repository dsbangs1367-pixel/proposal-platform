import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

export function statusColor(status: string) {
  switch (status) {
    case 'draft': return 'bg-gray-100 text-gray-700'
    case 'sent': return 'bg-blue-100 text-blue-700'
    case 'viewed': return 'bg-yellow-100 text-yellow-700'
    case 'signed': return 'bg-purple-100 text-purple-700'
    case 'paid': return 'bg-green-100 text-green-700'
    default: return 'bg-gray-100 text-gray-700'
  }
}

export function statusLabel(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1)
}
