import { useState, useEffect, useRef } from 'react'
import { getEventi, type GetEventiParams } from '@/services/gestionale'
import type { EventoResponse } from '@/types/gestionale'

interface UseEventiResult {
  data: EventoResponse[]
  isLoading: boolean
  isError: boolean
}

interface FetchState {
  filterKey: string   // quale filtro ha prodotto questi dati
  data: EventoResponse[]
  isLoading: boolean
  isError: boolean
}

/**
 * Lista eventi con filtri opzionali.
 * Fetch diretto senza cache: ogni cambio filtro avvia un fetch fresco e
 * cancella la richiesta precedente via AbortController.
 * Il filterKey viene salvato nello state insieme ai dati → nessun render
 * con dati appartenenti al filtro sbagliato.
 */
export const useEventi = (filters: GetEventiParams = {}): UseEventiResult => {
  // Serializza filtri come dep stabile (undefined → null per distinguere i valori)
  const filterKey = JSON.stringify(filters, (_, v) => (v === undefined ? null : v))

  const [state, setState] = useState<FetchState>({
    filterKey,
    data: [],
    isLoading: true,
    isError: false,
  })

  // Ref ai filtri correnti per evitare stale closure nel fetch
  const filtersRef = useRef(filters)
  filtersRef.current = filters

  useEffect(() => {
    const currentKey = filterKey  // cattura il key di questo ciclo
    const controller = new AbortController()

    setState((prev) => ({
      ...prev,
      filterKey: currentKey,
      isLoading: true,
      isError: false,
    }))

    getEventi(filtersRef.current, controller.signal)
      .then((result) => {
        setState({ filterKey: currentKey, data: result, isLoading: false, isError: false })
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setState((prev) => ({ ...prev, isLoading: false, isError: true }))
        }
      })

    return () => {
      controller.abort()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey])

  // Se il filterKey nello state non corrisponde al filterKey attuale
  // (es. nel render intermedio prima che l'effect scatti) → mostra loading
  if (state.filterKey !== filterKey) {
    return { data: [], isLoading: true, isError: false }
  }

  return { data: state.data, isLoading: state.isLoading, isError: state.isError }
}
