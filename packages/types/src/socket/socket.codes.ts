const socket_codes = {
  NORMAL_CLOSURE: 1000,
  DUPLICATE_CONNECTION: 3001,
  SPECTATOR_LIMIT_REACHED: 3002,
  UNAUTHENTICATED: 3003,
} as const;

// Check if a close code should prevent reconnection
const isIntentionalClosure = (code: number): boolean => {
  return (Object.values(socket_codes) as number[]).includes(code);
};

export { socket_codes, isIntentionalClosure };
