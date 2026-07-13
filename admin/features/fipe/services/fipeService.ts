const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

const getSessionHeaders = (): Record<string, string> => {
  if (typeof window === "undefined") return {}
  const sessionStr = localStorage.getItem("veiculos_admin_session")
  if (!sessionStr) return {}
  try {
    const session = JSON.parse(sessionStr)
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${session.token}`,
      "x-tenant-id": String(session.activeTenant?.id || ""),
      "ngrok-skip-browser-warning": "1",
      "Bypass-Tunnel-Reminder": "true",
    }
  } catch {
    return {}
  }
}

export interface FipeSyncState {
  isSyncing: boolean;
  isPaused: boolean;
  currentStage: 'idle' | 'initializing' | 'brands' | 'models' | 'prices' | 'completed' | 'stopped';
  vehicleTypes: ('cars' | 'motorcycles' | 'trucks')[];
  currentVehicleType: 'cars' | 'motorcycles' | 'trucks' | null;
  currentBrandName: string | null;
  currentModelName: string | null;
  totalBrands: number;
  processedBrands: number;
  totalModels: number;
  processedModels: number;
  totalPrices: number;
  processedPrices: number;
  delayMs: number;
  onlyMainBrands: boolean;
  maxModelsPerBrand: number;
  maxYearsPerModel: number;
  errorCount: number;
  errorMessage: string | null;
  logs: string[];
  token?: string | null;
  syncOnlyModels?: boolean;
}

export const fipeService = {
  async getStatus(): Promise<FipeSyncState> {
    const res = await fetch(`${API_BASE_URL}/fipe/sync/status`, {
      method: "GET",
      headers: getSessionHeaders(),
    });
    if (!res.ok) throw new Error("Erro ao obter status de sincronização");
    return res.json();
  },

  async startSync(options: Partial<FipeSyncState>): Promise<FipeSyncState> {
    const res = await fetch(`${API_BASE_URL}/fipe/sync/start`, {
      method: "POST",
      headers: getSessionHeaders(),
      body: JSON.stringify(options),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Erro ao iniciar sincronização");
    }
    return res.json();
  },

  async pauseSync(): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/fipe/sync/pause`, {
      method: "POST",
      headers: getSessionHeaders(),
    });
    if (!res.ok) throw new Error("Erro ao pausar sincronização");
  },

  async resumeSync(): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/fipe/sync/resume`, {
      method: "POST",
      headers: getSessionHeaders(),
    });
    if (!res.ok) throw new Error("Erro ao retomar sincronização");
  },

  async stopSync(): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/fipe/sync/stop`, {
      method: "POST",
      headers: getSessionHeaders(),
    });
    if (!res.ok) throw new Error("Erro ao parar sincronização");
  },

  async clearSync(): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/fipe/sync/clear`, {
      method: "POST",
      headers: getSessionHeaders(),
    });
    if (!res.ok) throw new Error("Erro ao limpar dados da FIPE");
  },

  async getBrands(type: 'car' | 'motorcycle' | 'truck'): Promise<any[]> {
    const res = await fetch(`${API_BASE_URL}/fipe/brands?type=${type}`, {
      method: "GET",
      headers: getSessionHeaders(),
    });
    if (!res.ok) throw new Error("Erro ao obter marcas");
    return res.json();
  },

  async getModels(brandId: string): Promise<any[]> {
    const res = await fetch(`${API_BASE_URL}/fipe/models?brandId=${brandId}`, {
      method: "GET",
      headers: getSessionHeaders(),
    });
    if (!res.ok) throw new Error("Erro ao obter modelos");
    return res.json();
  },

  async getPrices(modelId: string): Promise<any[]> {
    const res = await fetch(`${API_BASE_URL}/fipe/prices?modelId=${modelId}`, {
      method: "GET",
      headers: getSessionHeaders(),
    });
    if (!res.ok) throw new Error("Erro ao obter preços");
    return res.json();
  },
};
