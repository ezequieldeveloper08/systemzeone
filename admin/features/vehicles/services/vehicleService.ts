import { Vehicle, CreateVehicleInput } from "../types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

const INITIAL_VEHICLES: Omit<Vehicle, "id" | "createdAt">[] = [
  // --- CAPRI CHEVROLET ---
  {
    tenantId: "t-1",
    title: "Chevrolet Corvette C8 Stingray V8",
    brand: "Chevrolet",
    model: "Corvette C8",
    year: 2024,
    description: "<p>O Chevrolet Corvette C8 Stingray redefine o conceito de superesportivo com seu motor V8 central traseiro de 6.2L LT2, entregando 495 cv de potência e 630 Nm de torque.</p>",
    price: 1250000,
    salePrice: 1190000,
    status: "published",
    images: ["https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=800&auto=format&fit=crop&q=80"],
    km: 0,
    transmission: "automatic",
    fuel: "gasoline",
    color: "Vermelho Adrenalina",
    tags: ["Superesportivo", "Zero KM", "Destaque"],
    collections: ["Mais Vendidos", "Destaques"],
    type: "car",
    doors: 2,
    engine: "6.2L V8 LT2",
    bodyType: "Superesportivo",
    features: ["Ar Condicionado", "Freio ABS", "Alarme", "Bancos de Couro", "Sensor de Ré", "Câmera de Ré", "Controle de Tração"],
  },
  {
    tenantId: "t-1",
    title: "Chevrolet Camaro SS Conversível 6.2 V8",
    brand: "Chevrolet",
    model: "Camaro SS",
    year: 2022,
    description: "<p>Sinta a liberdade do vento a bordo do lendário muscle car americano equipado com motor V8 de 461 cv.</p>",
    price: 550000,
    status: "published",
    images: ["https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&auto=format&fit=crop&q=80"],
    km: 12500,
    transmission: "automatic",
    fuel: "gasoline",
    color: "Amarelo Metálico",
    tags: ["Conversível", "Seminovo"],
    collections: ["Destaques"],
    type: "car",
    doors: 2,
    engine: "6.2L V8",
    bodyType: "Conversível",
    features: ["Ar Condicionado", "Freio ABS", "Bancos de Couro", "Sensor de Ré", "Rodas de Liga Leve"],
  },
  {
    tenantId: "t-1",
    title: "Chevrolet Tracker Premier 1.2 Turbo",
    brand: "Chevrolet",
    model: "Tracker",
    year: 2023,
    description: "<p>O SUV urbano inteligente. Teto solar panorâmico, alerta de colisão frontal e motor turbo eficiente.</p>",
    price: 155000,
    status: "published",
    images: ["https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&auto=format&fit=crop&q=80"],
    km: 15400,
    transmission: "automatic",
    fuel: "flex",
    color: "Azul Eclipse",
    tags: ["SUV", "Turbo", "Teto Solar"],
    collections: ["Mais Vendidos"],
    type: "car",
    doors: 4,
    engine: "1.2 Turbo",
    bodyType: "SUV",
    features: ["Ar Condicionado", "Freio ABS", "Alarme", "Teto Solar", "Direção Hidráulica", "Sensor de Ré"],
  },
  // --- MOB SHOP ---
  {
    tenantId: "t-2",
    title: "BMW M3 Competition 3.0 BiTurbo",
    brand: "BMW",
    model: "M3",
    year: 2023,
    description: "<p>O sedan esportivo mais cobiçado do mundo. Motor 6 cilindros em linha TwinPower Turbo com 510 cv.</p>",
    price: 820000,
    salePrice: 799000,
    status: "published",
    images: ["https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=800&auto=format&fit=crop&q=80"],
    km: 4800,
    transmission: "automatic",
    fuel: "gasoline",
    color: "Cinza Dravit",
    tags: ["Sedan Esportivo", "Seminovo Premium"],
    collections: ["Destaques"],
    type: "car",
    doors: 4,
    engine: "3.0 TwinPower Turbo",
    bodyType: "Sedan",
    features: ["Ar Condicionado", "Freio ABS", "Bancos de Couro", "Direção Hidráulica", "Câmera de Ré", "Controle de Estabilidade"],
  },
  {
    tenantId: "t-2",
    title: "Porsche 911 Carrera S Coupe (992)",
    brand: "Porsche",
    model: "911 Carrera S",
    year: 2021,
    description: "<p>O ícone atemporal dos carros esportivos. Motor Boxer 3.0 biturbo de 450 cv e câmbio PDK.</p>",
    price: 1050000,
    status: "published",
    images: ["https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop&q=80"],
    km: 14900,
    transmission: "automatic",
    fuel: "gasoline",
    color: "Giz (Chalk)",
    tags: ["Esportivo", "Chave Reserva"],
    collections: ["Mais Vendidos"],
    type: "car",
    doors: 2,
    engine: "3.0 Boxer Biturbo",
    bodyType: "Esportivo",
    features: ["Ar Condicionado", "Freio ABS", "Alarme", "Bancos de Couro", "Sensor de Ré", "Câmera de Ré"],
  },
]

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
      "ngrok-skip-browser-warning": "true",
    }
  } catch {
    return {}
  }
}

export const vehicleService = {
  initialize() {
    // No-op
  },

  async getAllVehicles(tenantId: string): Promise<Vehicle[]> {
    const response = await fetch(`${API_BASE_URL}/vehicles`, {
      method: "GET",
      headers: getSessionHeaders(),
    })

    if (!response.ok) {
      throw new Error("Erro ao obter lista de veículos do servidor.")
    }

    const data = (await response.json()) as Vehicle[]

    // Auto-seed if database is empty for this tenant
    if (data.length === 0) {
      console.log("Seeding initial vehicles for tenant...", tenantId)
      const seeded: Vehicle[] = []

      // Determine which mock data to seed based on current tenant name/id
      const isMobShop = tenantId === "t-2"
      const seedSource = INITIAL_VEHICLES.filter(
        (v) => (isMobShop && v.tenantId === "t-2") || (!isMobShop && v.tenantId === "t-1")
      )

      for (const item of seedSource) {
        try {
          const { tenantId: _, ...input } = item
          const created = await this.createVehicle(tenantId, input)
          seeded.push(created)
        } catch (e) {
          console.error("Failed to seed vehicle:", e)
        }
      }
      if (seeded.length > 0) {
        return seeded
      }
    }

    return data
  },

  async getVehicleById(tenantId: string, id: string): Promise<Vehicle | null> {
    const response = await fetch(`${API_BASE_URL}/vehicles/${id}`, {
      method: "GET",
      headers: getSessionHeaders(),
    })

    if (response.status === 404) return null
    if (!response.ok) {
      throw new Error("Erro ao obter detalhes do veículo.")
    }

    return response.json()
  },

  async createVehicle(tenantId: string, input: CreateVehicleInput): Promise<Vehicle> {
    const response = await fetch(`${API_BASE_URL}/vehicles`, {
      method: "POST",
      headers: getSessionHeaders(),
      body: JSON.stringify(input),
    })

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}))
      throw new Error(errData.message || "Erro ao criar veículo no servidor.")
    }

    return response.json()
  },

  async updateVehicle(tenantId: string, id: string, input: Partial<CreateVehicleInput>): Promise<Vehicle> {
    const response = await fetch(`${API_BASE_URL}/vehicles/${id}`, {
      method: "PUT",
      headers: getSessionHeaders(),
      body: JSON.stringify(input),
    })

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}))
      throw new Error(errData.message || "Erro ao atualizar veículo no servidor.")
    }

    return response.json()
  },

  async deleteVehicle(tenantId: string, id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/vehicles/${id}`, {
      method: "DELETE",
      headers: getSessionHeaders(),
    })

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}))
      throw new Error(errData.message || "Erro ao remover veículo no servidor.")
    }
  },

  async uploadImage(tenantId: string, file: File): Promise<string> {
    const formData = new FormData()
    formData.append("file", file)

    const headers = getSessionHeaders()
    delete headers["Content-Type"]

    const response = await fetch(`${API_BASE_URL}/vehicles/upload`, {
      method: "POST",
      headers,
      body: formData,
    })

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}))
      throw new Error(errData.message || "Erro ao fazer upload de imagem.")
    }

    const data = await response.json()
    return data.url
  },
}
