// 앱 메모리에만 유지 — 앱 재시작 시 자동 초기화
let pendingCode: string | null = null;
const listeners = new Set<(code: string | null) => void>();

export function setPendingInviteCode(code: string) {
  pendingCode = code;
  listeners.forEach(l => l(code));
}

export function getPendingInviteCode(): string | null {
  return pendingCode;
}

export function clearPendingInviteCode() {
  pendingCode = null;
}

export function onPendingInviteChange(listener: (code: string | null) => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}