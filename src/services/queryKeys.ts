export const queryKeys = {
  emails: {
    all: ['emails'] as const,
    pending: () => [...queryKeys.emails.all, 'pending'] as const,
    detail: (id: string) => [...queryKeys.emails.all, 'detail', id] as const,
  },
}
