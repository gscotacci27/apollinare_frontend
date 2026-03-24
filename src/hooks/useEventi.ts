import { useState, useEffect, useRef } from 'react'
import { getEventi, type GetEventiParams } from '@/services/gestionale'
import type { EventoResponse } from '@/types/gestionale'

interface UseEventiResult {
  data: EventoResponse[]
  isLoading: boolean
  isError: boolean
}

/**
 * Lista eventi con filtri opzionali.
 * Implementazione diretta senza cache React Query: ogni cambio filtro
 * avvia un fetch fresco e cancella la richiesta precedente via AbortController.
 */
export const useEventi = (filters: GetEventiParams = {}): UseEventiResult => {
  const [data, setData] = useState<EventoResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)

  // Serializza i filtri per usarli come dependency stabile
  const filterKey = JSON.stringify(filters, (_, v) => (v === undefined ? null : v))

  // Ref per i filtri correnti (evita stale closure nel fetch)
  const filtersRef = useRef(filters)
  filtersRef.current = filters

  useEffect(() => {
    const controller = new AbortController()
    setIsLoading(true)
    setIsError(false)

    getEventi(filtersRef.current, controller.signal)
      .then((result) => {
        setData(result)
        setIsLoading(false)
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setIsError(true)
          setIsLoading(false)
        }
      })

    return () => {
      controller.abort()
    }
    // filterKey è la dependency: cambia ad ogni cambio filtro
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey])

  return { data, isLoading, isError }
}
