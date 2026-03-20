export const queryKeys = {
  emails: {
    all: ['emails'] as const,
    pending: () => [...queryKeys.emails.all, 'pending'] as const,
    detail: (id: string) => [...queryKeys.emails.all, 'detail', id] as const,
  },
  eventi: {
    all: ['eventi'] as const,
    // stato nel key → cache separata per ogni filtro (nessun mixing)
    list: (stato?: number) => [...queryKeys.eventi.all, 'list', stato ?? 'all'] as const,
    detail: (id: number) => [...queryKeys.eventi.all, 'detail', id] as const,
  },
  lookup: {
    location: ['lookup', 'location'] as const,
    tipiEvento: ['lookup', 'tipi-evento'] as const,
  },
}
