"use client"

import { useEffect } from 'react'
import { toast } from 'sonner'

const buildId = process.env.NEXT_PUBLIC_BUILD_ID || 'dev-build'

export function PWARegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return
    if (!('serviceWorker' in navigator)) return

    let didRefresh = false

    const refreshOnControllerChange = () => {
      if (didRefresh) return
      didRefresh = true
      window.location.reload()
    }

    const triggerUpdate = (worker: ServiceWorker) => {
      toast.message('Updating app…', {
        description: 'New version detected, refreshing.',
        duration: 2000,
      })
      worker.postMessage({ type: 'SKIP_WAITING' })
    }

    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register(`/sw.js?build=${encodeURIComponent(buildId)}`, {
          scope: '/',
        })

        const handleWaiting = (sw: ServiceWorker | null) => {
          if (!sw) return
          triggerUpdate(sw)
        }

        const monitor = (reg: ServiceWorkerRegistration) => {
          handleWaiting(reg.waiting)

          reg.addEventListener('updatefound', () => {
            const installing = reg.installing
            if (!installing) return

            installing.addEventListener('statechange', () => {
              if (installing.state === 'installed') {
                handleWaiting(reg.waiting)
              }
            })
          })
        }

        monitor(registration)

        navigator.serviceWorker.addEventListener('controllerchange', refreshOnControllerChange)
      } catch (err) {
        console.error('Service worker registration failed:', err)
      }
    }

    if (document.readyState === 'complete') {
      register()
    } else {
      window.addEventListener('load', register, { once: true })
      return () => window.removeEventListener('load', register)
    }

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', refreshOnControllerChange)
    }
  }, [])

  return null
}
