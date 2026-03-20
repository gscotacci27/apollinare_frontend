import type { GetEventiParams } from './gestionale'

export const queryKeys = {
  emails: {
    all: ['emails'] as const,
    pending: () => [...queryKeys.emails.all, 'pending'] as const,
    detail: (id: string) => [...queryKeys.emails.all, 'detail', id] as const,
  },
  eventi: {
    all: ['eventi'] as const,
    // Tutti i filtri nel key → cache separata per ogni combinazione (nessun mixing)
    list: (filters: GetEventiParams) => [...queryKeys.eventi.all, 'list', filters] as const,
    detail: (id: number) => [...queryKeys.eventi.all, 'detail', id] as const,
  },
  lista: {
    byEvento: (id: number) => ['lista', id] as const,
  },
  scheda: {
    byEvento: (id: number) => ['scheda', id] as const,
  },
  lookup: {
    location: ['lookup', 'location'] as const,
    tipiEvento: ['lookup', 'tipi-evento'] as const,
    articoli: ['lookup', 'articoli'] as const,
    sezioni: ['lookup', 'sezioni'] as const,
  },
  tabelle: {
    location: ['tabelle', 'location'] as const,
    locationSimili: (id: number) => ['tabelle', 'location', id, 'simili'] as const,
    articoli: (search?: string) => ['tabelle', 'articoli', search ?? ''] as const,
    sezioni: ['tabelle', 'sezioni'] as const,
    ospiti: ['tabelle', 'ospiti'] as const,
  },
  dashboard: {
    kpi: ['dashboard', 'kpi'] as const,
    prossimiEventi: ['dashboard', 'prossimi-eventi'] as const,
    listeAperte: ['dashboard', 'liste-aperte'] as const,
    caricoLavoro: ['dashboard', 'carico-lavoro'] as const,
    articoliSottoScorta: ['dashboard', 'articoli-sotto-scorta'] as const,
    attivitaRecenti: ['dashboard', 'attivita-recenti'] as const,
  },
}
