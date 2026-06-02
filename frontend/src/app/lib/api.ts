import { toast } from 'sonner';

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// ── Global request counter ─────────────────────────────────────────────────
let activeRequests = 0;
type LoadingListener = (loading: boolean) => void;
const loadingListeners: LoadingListener[] = [];

function setLoading(loading: boolean) {
  if (loading) {
    activeRequests++;
  } else {
    activeRequests = Math.max(0, activeRequests - 1);
  }
  const isLoading = activeRequests > 0;
  loadingListeners.forEach(fn => fn(isLoading));
}

export function subscribeToLoading(fn: LoadingListener): () => void {
  loadingListeners.push(fn);
  return () => {
    const i = loadingListeners.indexOf(fn);
    if (i > -1) loadingListeners.splice(i, 1);
  };
}

// ── Fetch wrapper ──────────────────────────────────────────────────────────
async function apiFetch(
  path: string,
  options: RequestInit = {},
  toastMessages?: { loading?: string; success?: string; error?: string }
) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  setLoading(true);

  const toastId = toastMessages?.loading
    ? toast.loading(toastMessages.loading)
    : undefined;

  try {
    const res = await fetch(`${BASE}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers as Record<string, string> || {}),
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      const message = err.error || 'Request failed';
      if (toastId !== undefined) {
        toast.error(toastMessages?.error || message, { id: toastId });
      }
      throw new Error(message);
    }

    const data = await res.json();

    if (toastId !== undefined) {
      toast.success(toastMessages?.success || 'Done', { id: toastId });
    }

    return data;
  } catch (err) {
    // If not already shown via toastId, fire an error toast automatically
    if (toastId === undefined && typeof window !== 'undefined') {
      // Only show auto-error toast for non-network errors to avoid duplicate alerts
      if (!(err instanceof TypeError)) {
        toast.error((err instanceof Error && err.message) || 'Something went wrong');
      }
    }
    throw err;
  } finally {
    setLoading(false);
  }
}

export default apiFetch;
