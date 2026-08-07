"use client"

import React, { useState, useEffect, useRef } from "react"
import Link from "next/link"
import {
  Search,
  ShoppingBag,
  MapPin,
  Clock,
  Plus,
  Minus,
  Trash2,
  X,
  ChevronRight,
  User,
  Ticket,
  Info,
  Phone,
  ArrowLeft,
  CheckCircle,
  HelpCircle
} from "lucide-react"

// Types matching admin features
interface OpeningHour {
  day: string
  isOpen: boolean
  openTime: string
  closeTime: string
}

interface Tenant {
  id: string
  name: string
  businessType: string
  logo: string | null
  banner: string | null
  bio: string | null
  phone: string | null
  address: string | null
  openingHours: OpeningHour[] | null
  instagram: string | null
  facebook: string | null
}

interface MenuItemVariation {
  id: string
  name: string
  price: number
  enabled: boolean
  order: number
}

interface ChoiceItemVariation {
  id: string
  additionalPrice: number
  variationId?: string | null
}

interface ChoiceItem {
  id: string
  name: string
  enabled: boolean
  order: number
  variations: ChoiceItemVariation[]
}

interface Choice {
  id: string
  name: string
  choiceType: number // 1 = additions/multiple, etc.
  minChoices: number
  maxChoices: number
  choiceItems: ChoiceItem[]
}

interface MenuItem {
  id: string
  tenantId: string
  name: string
  description: string
  category: string
  categoryItemId: string | null
  categoryItem: { name: string } | null
  status: "published" | "hidden"
  image: string | null
  variations: MenuItemVariation[]
  choices: Choice[]
  menuId: string | null
}

interface CartItem {
  cartId: string // Unique ID for this specific selection in the cart
  item: MenuItem
  selectedVariation: MenuItemVariation
  selectedChoices: {
    choiceId: string
    choiceName: string
    items: {
      itemId: string
      itemName: string
      additionalPrice: number
    }[]
  }[]
  quantity: number
  notes?: string
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

// High-quality unsplash fallbacks to ensure premium visuals
const HERO_FALLBACK = "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1600&auto=format&fit=crop&q=80"
const ITEM_FALLBACKS: Record<string, string> = {
  hamburguer: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80",
  batata: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800&auto=format&fit=crop&q=80",
  refrigerante: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=800&auto=format&fit=crop&q=80",
  pizza: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=800&auto=format&fit=crop&q=80",
  sobremesa: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&auto=format&fit=crop&q=80"
}

export default function RestaurantPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params)

  // API State
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // UI State
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("")
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [cep, setCep] = useState("")
  const [deliveryFee, setDeliveryFee] = useState<number | null>(null)
  const [calculatingCep, setCalculatingCep] = useState(false)
  const [couponCode, setCouponCode] = useState("")
  const [activeCoupon, setActiveCoupon] = useState<{ code: string; discount: number } | null>(null)
  const [couponError, setCouponError] = useState("")
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false)

  // Checkout Modal State
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false)
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [deliveryType, setDeliveryType] = useState<"delivery" | "takeaway" | "table">("delivery")
  const [address, setAddress] = useState("")
  const [tableNumber, setTableNumber] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("Pix")

  // Modal Customization State
  const [modalVariation, setModalVariation] = useState<MenuItemVariation | null>(null)
  const [modalSelectedChoices, setModalSelectedChoices] = useState<{
    choiceId: string
    choiceName: string
    items: {
      itemId: string
      itemName: string
      additionalPrice: number
    }[]
  }[]>([])
  const [modalQuantity, setModalQuantity] = useState(1)
  const [modalNotes, setModalNotes] = useState("")

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([])

  // Category refs for scroll tracking
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const categoryBarRef = useRef<HTMLDivElement | null>(null)

  // Fetch Tenant & Menu Items
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        setError(null)
        // 1. Fetch Tenant Details
        const tenantRes = await fetch(`${API_BASE_URL}/tenants/by-slug/${slug}`)
        if (!tenantRes.ok) {
          throw new Error("Não foi possível carregar os dados deste restaurante.")
        }
        const tenantData = await tenantRes.json()
        setTenant(tenantData)

        // 2. Fetch Menu Items (using our newly exposed public endpoint)
        const menuRes = await fetch(`${API_BASE_URL}/menu-public?tenantId=${tenantData.id}`)
        if (menuRes.ok) {
          const menuData = await menuRes.json()
          setMenuItems(menuData)

          // Set initial active category if items exist
          if (menuData.length > 0) {
            const firstCat = menuData[0].categoryItem?.name || menuData[0].category || "Geral"
            setActiveCategory(firstCat)
          }
        }
      } catch (err: any) {
        console.error(err)
        setError(err.message || "Erro desconhecido ao carregar página.")
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [slug])

  // Scroll spy logic to update active category tab based on page scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 180 // offset for sticky components

      let currentActive = activeCategory
      for (const catName in categoryRefs.current) {
        const element = categoryRefs.current[catName]
        if (element) {
          const offsetTop = element.offsetTop
          const offsetHeight = element.offsetHeight
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            currentActive = catName
            break
          }
        }
      }

      if (currentActive !== activeCategory && currentActive !== "") {
        setActiveCategory(currentActive)
        // Scroll the category tab bar to keep the active one visible
        const tabElement = document.getElementById(`tab-${currentActive}`)
        if (tabElement && categoryBarRef.current) {
          const container = categoryBarRef.current
          const scrollLeft = tabElement.offsetLeft - container.offsetWidth / 2 + tabElement.offsetWidth / 2
          container.scrollTo({ left: scrollLeft, behavior: "smooth" })
        }
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [activeCategory])

  // Helper: Get fallback image for menu items based on name keywords
  const getFallbackItemImage = (name: string) => {
    const lower = name.toLowerCase()
    if (lower.includes("hamburguer") || lower.includes("burger") || lower.includes("bacon") || lower.includes("combo")) {
      return ITEM_FALLBACKS.hamburguer
    }
    if (lower.includes("batata") || lower.includes("frita")) {
      return ITEM_FALLBACKS.batata
    }
    if (lower.includes("suco") || lower.includes("refrigerante") || lower.includes("bebida") || lower.includes("lata") || lower.includes("copo")) {
      return ITEM_FALLBACKS.refrigerante
    }
    if (lower.includes("pizza")) {
      return ITEM_FALLBACKS.pizza
    }
    if (lower.includes("gâteau") || lower.includes("doce") || lower.includes("bolo") || lower.includes("sorvete") || lower.includes("sobremesa")) {
      return ITEM_FALLBACKS.sobremesa
    }
    return ITEM_FALLBACKS.hamburguer // default fallback
  }

  // Helper: Formats prices
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(price)
  }

  // Group items by category (prefer CategoryItem entity name, fallback to raw category string)
  const groupedItems = menuItems.reduce<Record<string, MenuItem[]>>((groups, item) => {
    const categoryName = item.categoryItem?.name || item.category || "Geral"
    if (!groups[categoryName]) groups[categoryName] = []
    groups[categoryName].push(item)
    return groups
  }, {})

  // Filter grouped items based on search query
  const filteredGroupedItems = Object.keys(groupedItems).reduce<Record<string, MenuItem[]>>((filtered, category) => {
    const matched = groupedItems[category].filter(
      (item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    if (matched.length > 0) {
      filtered[category] = matched
    }
    return filtered
  }, {})

  // Check if store is open
  const isStoreOpen = () => {
    if (!tenant?.openingHours) return true // assume open if no configuration
    const now = new Date()
    const daysOfWeek = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"]
    const currentDay = daysOfWeek[now.getDay()]
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    const currentTimeMinutes = currentHour * 60 + currentMinute

    const todayConfig = tenant.openingHours.find((h) => h.day === currentDay)
    if (!todayConfig || !todayConfig.isOpen) return false

    const [openH, openM] = todayConfig.openTime.split(":").map(Number)
    const [closeH, closeM] = todayConfig.closeTime.split(":").map(Number)
    const openTimeMinutes = openH * 60 + openM
    const closeTimeMinutes = closeH * 60 + closeM

    if (closeTimeMinutes < openTimeMinutes) {
      // Handles shifts going past midnight (e.g. 18:00 to 02:00 next day)
      return currentTimeMinutes >= openTimeMinutes || currentTimeMinutes < closeTimeMinutes
    }
    return currentTimeMinutes >= openTimeMinutes && currentTimeMinutes < closeTimeMinutes
  }

  const getStoreStatusText = () => {
    if (!tenant) return ""
    const open = isStoreOpen()
    if (open) {
      return "Loja Aberta • Entrega e Retirada"
    }

    // Try to find next opening hour details
    const now = new Date()
    const daysOfWeek = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"]
    const currentDay = daysOfWeek[now.getDay()]
    const todayConfig = tenant.openingHours?.find((h) => h.day === currentDay)

    if (todayConfig && todayConfig.isOpen) {
      return `Loja Fechada no momento, abre hoje às ${todayConfig.openTime}`
    }
    return "Loja Fechada no momento"
  }

  // Handle opening of item detail modal
  const openItemDetail = (item: MenuItem) => {
    setSelectedItem(item)
    // Set default variation (first one enabled or first overall)
    const defVar = item.variations.find((v) => v.enabled) || item.variations[0] || null
    setModalVariation(defVar)
    setModalSelectedChoices([])
    setModalQuantity(1)
    setModalNotes("")
  }

  // Handles variation selection in modal
  const selectModalVariation = (variation: MenuItemVariation) => {
    setModalVariation(variation)
  }

  // Handles choices selection in modal
  const toggleModalChoiceItem = (choice: Choice, choiceItem: ChoiceItem, checked: boolean) => {
    setModalSelectedChoices((prev) => {
      const existingChoice = prev.find((c) => c.choiceId === choice.id)
      const additionalPrice = choiceItem.variations[0]?.additionalPrice || 0

      if (choice.maxChoices === 1) {
        // Radio behavior: replace existing selection
        if (!checked) {
          return prev.filter((c) => c.choiceId !== choice.id)
        }
        const updatedChoice = {
          choiceId: choice.id,
          choiceName: choice.name,
          items: [{ itemId: choiceItem.id, itemName: choiceItem.name, additionalPrice }]
        }
        if (existingChoice) {
          return prev.map((c) => (c.choiceId === choice.id ? updatedChoice : c))
        }
        return [...prev, updatedChoice]
      } else {
        // Checkbox behavior: add/remove item from active choice list
        if (!existingChoice) {
          if (!checked) return prev
          return [
            ...prev,
            {
              choiceId: choice.id,
              choiceName: choice.name,
              items: [{ itemId: choiceItem.id, itemName: choiceItem.name, additionalPrice }]
            }
          ]
        }

        const isItemAlreadySelected = existingChoice.items.some((i) => i.itemId === choiceItem.id)

        if (checked && !isItemAlreadySelected) {
          // Check limits
          if (existingChoice.items.length >= choice.maxChoices) {
            // Reached limit, remove the first item and append new
            const newItems = [...existingChoice.items.slice(1), { itemId: choiceItem.id, itemName: choiceItem.name, additionalPrice }]
            return prev.map((c) => (c.choiceId === choice.id ? { ...c, items: newItems } : c))
          }
          const newItems = [...existingChoice.items, { itemId: choiceItem.id, itemName: choiceItem.name, additionalPrice }]
          return prev.map((c) => (c.choiceId === choice.id ? { ...c, items: newItems } : c))
        } else if (!checked && isItemAlreadySelected) {
          const newItems = existingChoice.items.filter((i) => i.itemId !== choiceItem.id)
          if (newItems.length === 0) {
            return prev.filter((c) => c.choiceId !== choice.id)
          }
          return prev.map((c) => (c.choiceId === choice.id ? { ...c, items: newItems } : c))
        }
        return prev
      }
    })
  }

  // Calculate current item price in modal (including selected variation and choices)
  const calculateModalItemPrice = () => {
    if (!selectedItem) return 0
    const varPrice = modalVariation?.price || 0
    const additionsPrice = modalSelectedChoices.reduce((total, choice) => {
      const choiceTotal = choice.items.reduce((sum, item) => sum + item.additionalPrice, 0)
      return total + choiceTotal
    }, 0)
    return varPrice + additionsPrice
  }

  // Add customized item from modal to cart
  const addModalItemToCart = () => {
    if (!selectedItem || !modalVariation) return

    const cartId = `${selectedItem.id}-${modalVariation.id}-${JSON.stringify(modalSelectedChoices)}-${modalNotes}`

    // Check if exactly same item with same options already exists in cart
    const existingIndex = cart.findIndex((i) => i.cartId === cartId)

    if (existingIndex > -1) {
      // Update quantity
      setCart((prev) =>
        prev.map((item, idx) => (idx === existingIndex ? { ...item, quantity: item.quantity + modalQuantity } : item))
      )
    } else {
      // Add as new entry
      const newItem: CartItem = {
        cartId,
        item: selectedItem,
        selectedVariation: modalVariation,
        selectedChoices: modalSelectedChoices,
        quantity: modalQuantity,
        notes: modalNotes
      }
      setCart((prev) => [...prev, newItem])
    }

    setSelectedItem(null) // Close modal
  }

  // Cart Adjustments
  const updateCartQuantity = (cartId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.cartId === cartId) {
            const newQty = item.quantity + delta
            return newQty > 0 ? { ...item, quantity: newQty } : null
          }
          return item
        })
        .filter((item): item is CartItem => item !== null)
    )
  }

  const removeCartItem = (cartId: string) => {
    setCart((prev) => prev.filter((item) => item.cartId !== cartId))
  }

  const clearCart = () => {
    setCart([])
  }

  // CEP Calculation simulation
  const handleCalculateCep = (e: React.FormEvent) => {
    e.preventDefault()
    if (cep.length < 8) return
    setCalculatingCep(true)
    setTimeout(() => {
      // Simple lookup simulation
      const randomFee = Math.floor(Math.random() * 8) + 2 // R$2 to R$9 fee
      setDeliveryFee(randomFee)
      setCalculatingCep(false)
    }, 800)
  }

  // Coupon code verification simulation
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault()
    setCouponError("")
    const code = couponCode.trim().toUpperCase()
    if (!code) return

    if (code === "ZEONE10" || code === "SANDUICHE10") {
      setActiveCoupon({ code, discount: 0.1 }) // 10% discount
    } else if (code === "ZEONE15") {
      setActiveCoupon({ code, discount: 0.15 }) // 15% discount
    } else {
      setCouponError("Cupom inválido ou expirado.")
      setActiveCoupon(null)
    }
  }

  // Cart Totals Calculations
  const calculateCartSubtotal = () => {
    return cart.reduce((total, cartItem) => {
      const varPrice = cartItem.selectedVariation.price
      const choicesPrice = cartItem.selectedChoices.reduce((sum, choice) => {
        return sum + choice.items.reduce((itemSum, item) => itemSum + item.additionalPrice, 0)
      }, 0)
      return total + (varPrice + choicesPrice) * cartItem.quantity
    }, 0)
  }

  const calculateDiscount = () => {
    if (!activeCoupon) return 0
    return calculateCartSubtotal() * activeCoupon.discount
  }

  const calculateCartTotal = () => {
    const subtotal = calculateCartSubtotal()
    const discount = calculateDiscount()
    const fee = deliveryFee || 0
    return Math.max(0, subtotal - discount + fee)
  }

  const handleOpenCheckout = () => {
    if (cart.length === 0) return
    setIsCheckoutModalOpen(true)
  }

  // Submits final checkout to NestJS backend
  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tenant || !customerName || !customerPhone) return
    if (deliveryType === "delivery" && !address) return
    if (deliveryType === "table" && !tableNumber) return

    setIsCheckoutLoading(true)
    try {
      // Structure the order items to match what the backend and admin panel expect
      const orderItems = cart.map((cartItem) => {
        const selectedOptions = cartItem.selectedChoices.flatMap((choice) =>
          choice.items.map((i) => ({
            groupName: choice.choiceName,
            optionName: i.itemName,
            price: i.additionalPrice,
          }))
        )

        return {
          menuItemId: cartItem.item.id,
          name: cartItem.selectedVariation.name !== "Padrão" && cartItem.selectedVariation.name !== "Default"
            ? `${cartItem.item.name} (${cartItem.selectedVariation.name})`
            : cartItem.item.name,
          price: cartItem.selectedVariation.price,
          quantity: cartItem.quantity,
          notes: cartItem.notes || "",
          selectedOptions,
          variation: {
            id: cartItem.selectedVariation.id,
            name: cartItem.selectedVariation.name,
            price: cartItem.selectedVariation.price,
          },
          choices: cartItem.selectedChoices.map((choice) => ({
            choiceId: choice.choiceId,
            choiceName: choice.choiceName,
            items: choice.items.map((i) => ({
              itemId: i.itemId,
              itemName: i.itemName,
              additionalPrice: i.additionalPrice,
            }))
          }))
        }
      })

      const payload = {
        customerName,
        customerPhone,
        deliveryType,
        address: deliveryType === "delivery" ? address : null,
        tableNumber: deliveryType === "table" ? tableNumber : null,
        totalPrice: calculateCartTotal(),
        items: orderItems,
        paymentMethod,
        tenantId: tenant.id
      }

      const res = await fetch(`${API_BASE_URL}/orders-public`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        throw new Error("Falha ao criar o pedido na API.")
      }

      const createdOrder = await res.json()

      // Save to localStorage
      const prevOrdersStr = localStorage.getItem("zeone_customer_orders")
      const prevOrders = prevOrdersStr ? JSON.parse(prevOrdersStr) : []
      const newOrderInfo = {
        id: createdOrder.id,
        restaurantName: tenant.name,
        restaurantSlug: slug,
        date: new Date().toISOString(),
        totalPrice: payload.totalPrice,
      }
      localStorage.setItem("zeone_customer_orders", JSON.stringify([newOrderInfo, ...prevOrders]))

      setIsCheckoutModalOpen(false)
      setIsSuccess(true)
      setCart([])
      setDeliveryFee(null)
      setActiveCoupon(null)
      setCouponCode("")
      setCep("")
    } catch (err: any) {
      console.error(err)
      alert("Erro ao enviar pedido: " + (err.message || "Tente novamente."))
    } finally {
      setIsCheckoutLoading(false)
    }
  }

  // Category scrolling action
  const scrollToCategory = (catName: string) => {
    setActiveCategory(catName)
    const element = categoryRefs.current[catName]
    if (element) {
      const topOffset = element.offsetTop - 140 // offsets header & categories bar
      window.scrollTo({ top: topOffset, behavior: "smooth" })
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-50 text-neutral-900">
        <div className="h-12 w-12 border-4 border-lime-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-semibold text-lg animate-pulse text-lime-700">Carregando cardápio do restaurante...</p>
      </div>
    )
  }

  if (error || !tenant) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-50 text-neutral-900 p-6 text-center">
        <HelpCircle className="size-16 text-neutral-400 mb-4" />
        <h1 className="text-2xl font-extrabold mb-2 text-neutral-800">Restaurante não encontrado</h1>
        <p className="text-neutral-500 max-w-md mb-6">{error || "Não conseguimos encontrar o restaurante correspondente."}</p>
        <Link href="/" className="px-5 py-2.5 bg-lime-600 hover:bg-lime-700 text-white font-bold rounded-xl transition-all shadow-md shadow-lime-600/20">
          Voltar ao início
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-950 font-sans antialiased">
      {/* 1. PUBLIC GLASS HEADER */}
      <header className="sticky top-0 z-40 w-full border-b border-neutral-200/60 bg-white/80 backdrop-blur-md transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo & Name */}
          <Link href="/" className="flex items-center gap-3 shrink-0">
            {tenant.logo ? (
              <div className="relative size-9 rounded-full overflow-hidden border border-neutral-200 bg-white">
                <img src={tenant.logo} alt={tenant.name} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="size-9 rounded-full bg-lime-600 text-white flex items-center justify-center font-bold text-base shadow-inner">
                {tenant.name.substring(0, 2).toUpperCase()}
              </div>
            )}
            <span className="hidden sm:inline font-extrabold text-neutral-800 tracking-tight text-lg">{tenant.name}</span>
          </Link>

          {/* Search bar inside header */}
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Buscar no cardápio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-full border border-neutral-200 bg-neutral-100/50 hover:bg-neutral-100 focus:bg-white text-sm outline-none focus:ring-2 focus:ring-lime-600/35 focus:border-lime-600 transition-all"
            />
          </div>

          {/* Public navigation shortcuts */}
          <nav className="flex items-center gap-4 text-sm font-semibold text-neutral-600 shrink-0">
            <Link href="/" className="hover:text-lime-600 transition-colors flex items-center gap-1.5 py-2">
              <span className="hidden md:inline">Início</span>
            </Link>
            <Link href="/pedidos" className="hover:text-lime-600 transition-colors flex items-center gap-1.5 py-2" title="Meus Pedidos">
              <Clock className="size-4 md:size-3.5 text-neutral-400" />
              <span className="hidden md:inline">Pedidos</span>
            </Link>
            <Link href="/perfil" className="hover:text-lime-600 transition-colors flex items-center gap-1.5 py-2">
              <User className="size-4 md:size-3.5 text-neutral-400" />
              <span className="hidden md:inline">Perfil</span>
            </Link>
          </nav>
        </div>
      </header>

      {/* 2. DYNAMIC BANNER HERO */}
      <section className="relative w-full h-[180px] md:h-[280px] overflow-hidden bg-neutral-900 shadow-md">
        <img
          src={tenant.banner || HERO_FALLBACK}
          alt={`${tenant.name} Banner`}
          className="w-full h-full object-cover opacity-85 select-none"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-neutral-950/20" />
      </section>

      {/* 3. RESTAURANT DATA PROFILE HEADER CARD */}
      <section className="relative max-w-7xl mx-auto px-4 md:px-6 -mt-16 md:-mt-24 mb-6 z-10">
        <div className="bg-white rounded-3xl p-5 md:p-6 border border-neutral-100 shadow-xl shadow-neutral-200/55 flex flex-col md:flex-row gap-5 md:items-center">
          {/* Circular avatar overlapping */}
          <div className="relative size-24 md:size-28 rounded-2xl md:rounded-3xl overflow-hidden border-4 border-white bg-white shadow-lg shrink-0 -mt-12 md:-mt-16 self-start md:self-auto">
            <img
              src={tenant.logo || getFallbackItemImage(tenant.name)}
              alt={`${tenant.name} Logo`}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 space-y-2.5">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl md:text-2xl font-black text-neutral-900 tracking-tight leading-tight uppercase">
                {tenant.name}
              </h1>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${isStoreOpen()
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                    : "bg-red-50 text-red-700 border border-red-100"
                  }`}
              >
                <span className={`size-1.5 rounded-full ${isStoreOpen() ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
                {isStoreOpen() ? "Aberto" : "Fechado"}
              </span>
            </div>

            {tenant.bio && <p className="text-neutral-500 text-sm font-medium leading-relaxed max-w-2xl">{tenant.bio}</p>}

            <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs font-semibold text-neutral-500">
              {tenant.address && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="size-3.5 text-lime-600 shrink-0" />
                  <span>{tenant.address}</span>
                  <button className="text-lime-600 hover:underline shrink-0 ml-1">Mais informações</button>
                </div>
              )}
            </div>
          </div>

          {/* Quick status bar on right */}
          <div className="border-t md:border-t-0 md:border-l border-neutral-100 pt-4 md:pt-0 md:pl-6 space-y-2 shrink-0">
            <div className="flex items-center gap-2 text-sm text-neutral-600 font-semibold">
              <Clock className="size-4 text-lime-600 shrink-0" />
              <span>{getStoreStatusText()}</span>
            </div>
            {tenant.phone && (
              <div className="flex items-center gap-2 text-sm text-neutral-600 font-semibold">
                <Phone className="size-4 text-lime-600 shrink-0" />
                <span>{tenant.phone}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. STICKY CATEGORIES BAR */}
      <section className="sticky top-16 z-30 w-full bg-white border-b border-neutral-200/70 shadow-sm shadow-neutral-100">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between gap-4">
          {/* Scrollable container for tabs */}
          <div
            ref={categoryBarRef}
            className="flex-1 flex items-center gap-1.5 py-3.5 overflow-x-auto scrollbar-none scroll-smooth"
          >
            {Object.keys(groupedItems).map((categoryName) => (
              <button
                key={categoryName}
                id={`tab-${categoryName}`}
                onClick={() => scrollToCategory(categoryName)}
                className={`px-4.5 py-1.5 rounded-full text-sm font-bold tracking-tight transition-all whitespace-nowrap ${activeCategory === categoryName
                    ? "bg-lime-600 text-white shadow-sm shadow-lime-600/25"
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                  }`}
              >
                {categoryName}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 5. MAIN CONTENT LAYOUT (SPLIT PANEL) */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* LEFT: Menu listing (8 cols) */}
          <section className="lg:col-span-8 space-y-12">
            {Object.keys(filteredGroupedItems).length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-neutral-100 shadow-sm">
                <Search className="size-12 text-neutral-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-neutral-700">Nenhum produto encontrado</h3>
                <p className="text-neutral-400 text-sm mt-1 max-w-sm mx-auto">
                  Tente alterar os termos da busca para encontrar pratos ou bebidas do cardápio.
                </p>
                <button
                  onClick={() => setSearchQuery("")}
                  className="mt-4 px-4 py-2 text-xs font-bold text-white bg-lime-600 rounded-lg hover:bg-lime-700"
                >
                  Limpar busca
                </button>
              </div>
            ) : (
              Object.keys(filteredGroupedItems).map((categoryName) => (
                <div
                  key={categoryName}
                  ref={(el) => {
                    categoryRefs.current[categoryName] = el
                  }}
                  className="space-y-4 pt-4"
                >
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-black text-neutral-800 tracking-tight uppercase">{categoryName}</h2>
                    <div className="h-0.5 flex-1 bg-neutral-200/50" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredGroupedItems[categoryName].map((item) => {
                      const minPrice = item.variations.length > 0
                        ? Math.min(...item.variations.filter(v => v.enabled).map((v) => v.price))
                        : 0

                      return (
                        <div
                          key={item.id}
                          onClick={() => openItemDetail(item)}
                          className="bg-white rounded-2xl p-4 border border-neutral-100 shadow-sm hover:shadow-md hover:border-neutral-200/80 transition-all cursor-pointer flex gap-4 select-none group"
                        >
                          <div className="flex-1 space-y-1.5 flex flex-col justify-between">
                            <div>
                              <h3 className="font-extrabold text-neutral-900 group-hover:text-lime-600 transition-colors text-base line-clamp-1">
                                {item.name}
                              </h3>
                              <p className="text-xs text-neutral-500 font-medium line-clamp-2 leading-relaxed mt-1">
                                {item.description}
                              </p>
                            </div>
                            <div className="font-extrabold text-neutral-800 text-sm">
                              {item.variations.length > 1 ? "A partir de " : ""}
                              <span className="text-lime-700">{formatPrice(minPrice)}</span>
                            </div>
                          </div>

                          <div className="relative size-20 md:size-24 rounded-xl overflow-hidden bg-neutral-100 shrink-0 border border-neutral-100">
                            <img
                              src={item.image || getFallbackItemImage(item.name)}
                              alt={item.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute bottom-1 right-1 size-7 rounded-lg bg-lime-600 text-white flex items-center justify-center shadow-lg shadow-lime-600/30 group-hover:bg-lime-700 transition-colors">
                              <Plus className="size-4" />
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))
            )}
          </section>

          {/* RIGHT: Cart / Sacola Sidebar (4 cols - Desktop Only) */}
          <section className="hidden lg:block lg:col-span-4 sticky top-52">
            <div className="bg-white rounded-3xl border border-neutral-200/70 shadow-lg shadow-neutral-100 overflow-hidden flex flex-col max-h-[calc(100vh-240px)]">
              {/* Cart Header */}
              <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="size-5 text-lime-600" />
                  <span className="font-black text-neutral-800 uppercase tracking-tight text-sm">Sua sacola</span>
                </div>
                {cart.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors"
                  >
                    LIMPAR
                  </button>
                )}
              </div>

              {cart.length === 0 ? (
                // Empty state
                <div className="p-8 text-center flex-1 overflow-y-auto">
                  <ShoppingBag className="size-12 text-neutral-200 mx-auto mb-3" />
                  <p className="text-neutral-500 font-bold text-sm">Sua sacola está vazia</p>
                  <p className="text-neutral-400 text-xs mt-1 leading-relaxed">
                    Adicione delícias do cardápio para iniciar seu pedido.
                  </p>
                </div>
              ) : (
                // Scrollable cart items list
                <div className="flex-1 overflow-y-auto p-5 space-y-4 divide-y divide-neutral-100">
                  {cart.map((cartItem, idx) => {
                    const basePrice = cartItem.selectedVariation.price
                    const choiceTotal = cartItem.selectedChoices.reduce((sum, c) => {
                      return sum + c.items.reduce((itemSum, item) => itemSum + item.additionalPrice, 0)
                    }, 0)
                    const itemUnitTotal = basePrice + choiceTotal

                    return (
                      <div key={cartItem.cartId} className={`pt-3 ${idx === 0 ? "pt-0" : ""} space-y-2`}>
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <span className="font-black text-neutral-800 text-xs leading-snug">
                              {cartItem.quantity}x {cartItem.item.name}
                            </span>
                            <span className="block text-neutral-400 font-bold text-[10px] uppercase mt-0.5">
                              {cartItem.selectedVariation.name}
                            </span>

                            {cartItem.selectedChoices.length > 0 && (
                              <div className="text-[10px] text-neutral-500 space-y-0.5 mt-1">
                                {cartItem.selectedChoices.map((choice) => (
                                  <div key={choice.choiceId}>
                                    <span className="font-semibold">{choice.choiceName}: </span>
                                    {choice.items.map((i) => i.itemName).join(", ")}
                                  </div>
                                ))}
                              </div>
                            )}

                            {cartItem.notes && (
                              <p className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100/50 mt-1 max-w-[90%] truncate">
                                Obs: {cartItem.notes}
                              </p>
                            )}
                          </div>

                          <div className="flex flex-col items-end gap-1">
                            <span className="font-extrabold text-neutral-800 text-xs whitespace-nowrap">
                              {formatPrice(itemUnitTotal * cartItem.quantity)}
                            </span>

                            <div className="relative size-12 rounded-lg overflow-hidden bg-neutral-50 border border-neutral-100">
                              <img
                                src={cartItem.item.image || getFallbackItemImage(cartItem.item.name)}
                                alt={cartItem.item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Adjust qty & Remove controls */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 border border-neutral-200 rounded-lg p-0.5">
                            <button
                              onClick={() => updateCartQuantity(cartItem.cartId, -1)}
                              className="size-5 flex items-center justify-center text-neutral-500 hover:text-neutral-800 transition-colors"
                            >
                              <Minus className="size-3" />
                            </button>
                            <span className="text-xs font-bold w-4 text-center">{cartItem.quantity}</span>
                            <button
                              onClick={() => updateCartQuantity(cartItem.cartId, 1)}
                              className="size-5 flex items-center justify-center text-neutral-500 hover:text-neutral-800 transition-colors"
                            >
                              <Plus className="size-3" />
                            </button>
                          </div>

                          <button
                            onClick={() => removeCartItem(cartItem.cartId)}
                            className="text-[11px] font-bold text-red-500 hover:underline flex items-center gap-1"
                          >
                            <Trash2 className="size-3 shrink-0" />
                            Remover
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Delivery tax CEP calculator */}
              <div className="p-5 border-t border-neutral-100 bg-neutral-50/50">
                <form onSubmit={handleCalculateCep} className="flex gap-2">
                  <div className="relative flex-1">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-neutral-400" />
                    <input
                      type="text"
                      maxLength={8}
                      placeholder="CEP da entrega..."
                      value={cep}
                      onChange={(e) => setCep(e.target.value.replace(/\D/g, ""))}
                      className="w-full h-8 pl-8.5 pr-2 rounded-lg border border-neutral-200/80 bg-white text-xs outline-none focus:ring-1 focus:ring-lime-600 focus:border-lime-600 transition-all font-semibold"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={cep.length < 8 || calculatingCep}
                    className="h-8 px-3 bg-white border border-neutral-200 text-xs font-bold rounded-lg hover:bg-neutral-50 active:bg-neutral-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-neutral-700"
                  >
                    {calculatingCep ? "Calculando..." : "Calcular"}
                  </button>
                </form>
                {deliveryFee !== null && (
                  <p className="text-[11px] font-bold text-emerald-600 mt-2 flex items-center gap-1">
                    <CheckCircle className="size-3" />
                    Taxa de entrega calculada: {deliveryFee === 0 ? "Grátis" : formatPrice(deliveryFee)}
                  </p>
                )}
              </div>

              {/* Summary calculations details */}
              {cart.length > 0 && (
                <div className="p-5 border-t border-neutral-100 space-y-2 bg-white shrink-0 text-xs">
                  <div className="flex justify-between text-neutral-500 font-bold">
                    <span>Subtotal</span>
                    <span>{formatPrice(calculateCartSubtotal())}</span>
                  </div>

                  {activeCoupon && (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>Desconto ({activeCoupon.code})</span>
                      <span>-{formatPrice(calculateDiscount())}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-neutral-500 font-bold">
                    <span>Taxa de entrega</span>
                    <span>{deliveryFee === null ? "Pendente" : deliveryFee === 0 ? "Grátis" : formatPrice(deliveryFee)}</span>
                  </div>

                  <div className="flex justify-between text-neutral-800 font-extrabold text-sm border-t border-dashed border-neutral-100 pt-2 mt-1">
                    <span>Total</span>
                    <span>{formatPrice(calculateCartTotal())}</span>
                  </div>

                  {/* Coupon toggle input */}
                  <form onSubmit={handleApplyCoupon} className="flex gap-2 pt-2 border-t border-dashed border-neutral-100 mt-2">
                    <div className="relative flex-1">
                      <Ticket className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-neutral-400" />
                      <input
                        type="text"
                        placeholder="Cupom (ex: ZEONE10)"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="w-full h-7 pl-7 pr-2 rounded border border-neutral-200 bg-white text-[10px] outline-none focus:ring-1 focus:ring-lime-600 font-semibold"
                      />
                    </div>
                    <button
                      type="submit"
                      className="h-7 px-2.5 bg-neutral-800 text-white text-[10px] font-bold rounded hover:bg-neutral-900 active:bg-black transition-all"
                    >
                      Aplicar
                    </button>
                  </form>
                  {couponError && <p className="text-[10px] text-red-500 font-bold">{couponError}</p>}
                  {activeCoupon && (
                    <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle className="size-3" />
                      Cupom {activeCoupon.code} aplicado: {(activeCoupon.discount * 100)}% de desconto
                    </p>
                  )}

                  {/* Complete Order Primary CTA */}
                  <button
                    onClick={handleOpenCheckout}
                    disabled={isCheckoutLoading}
                    className="w-full h-11 bg-lime-600 hover:bg-lime-700 text-white font-extrabold rounded-xl transition-all shadow-md shadow-lime-600/25 flex items-center justify-center gap-2 mt-4 disabled:opacity-75 uppercase tracking-wide text-xs"
                  >
                    {isCheckoutLoading ? (
                      <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      "Continuar pedido"
                    )}
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* 6. MODAL DETAILS OVERLAY (CUSTOMIZATION WINDOW) */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-neutral-100 overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-8 duration-300">
            {/* Header banner image in modal */}
            <div className="relative h-44 md:h-52 w-full bg-neutral-100 shrink-0">
              <img
                src={selectedItem.image || getFallbackItemImage(selectedItem.name)}
                alt={selectedItem.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 size-9 bg-neutral-900/60 text-white rounded-full flex items-center justify-center hover:bg-neutral-900/80 hover:scale-105 active:scale-95 transition-all shadow-lg backdrop-blur-sm"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Scrollable details */}
            <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-6">
              <div className="space-y-2">
                <h2 className="text-lg md:text-xl font-black text-neutral-900 tracking-tight leading-tight uppercase">
                  {selectedItem.name}
                </h2>
                <p className="text-xs text-neutral-500 font-medium leading-relaxed">
                  {selectedItem.description}
                </p>
                {modalVariation && (
                  <p className="text-lime-700 font-extrabold text-sm">
                    {formatPrice(calculateModalItemPrice())}
                  </p>
                )}
              </div>

              {/* Variations choice (Tamanho / Sabor) if there are multiple variations */}
              {selectedItem.variations.filter(v => v.enabled).length > 1 && (
                <div className="space-y-3">
                  <div className="bg-neutral-100 px-4 py-2 rounded-xl flex items-center justify-between border border-neutral-200/50">
                    <span className="text-xs font-black text-neutral-800 uppercase tracking-wider">Selecione o tamanho</span>
                    <span className="text-[10px] bg-lime-600 text-white font-bold px-2 py-0.5 rounded-full">OBRIGATÓRIO</span>
                  </div>

                  <div className="space-y-2">
                    {selectedItem.variations
                      .filter((v) => v.enabled)
                      .map((v) => (
                        <label
                          key={v.id}
                          className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer select-none ${modalVariation?.id === v.id
                              ? "border-lime-600 bg-lime-50/20 text-lime-900"
                              : "border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50/50"
                            }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="item-variation"
                              checked={modalVariation?.id === v.id}
                              onChange={() => selectModalVariation(v)}
                              className="accent-lime-600 size-4"
                            />
                            <span className="text-xs font-bold">{v.name}</span>
                          </div>
                          <span className="text-xs font-extrabold text-neutral-700">{formatPrice(v.price)}</span>
                        </label>
                      ))}
                  </div>
                </div>
              )}

              {/* Option Choice Groups (Modifiers) */}
              {selectedItem.choices.map((choice) => (
                <div key={choice.id} className="space-y-3">
                  <div className="bg-neutral-100 px-4 py-2 rounded-xl flex items-center justify-between border border-neutral-200/50">
                    <div className="space-y-0.5">
                      <span className="text-xs font-black text-neutral-800 uppercase tracking-wider block">
                        {choice.name}
                      </span>
                      <span className="text-[10px] text-neutral-500 font-bold block">
                        {choice.minChoices > 0
                          ? `Escolha de ${choice.minChoices} até ${choice.maxChoices} opções`
                          : `Escolha até ${choice.maxChoices} opções`}
                      </span>
                    </div>
                    {choice.minChoices > 0 && (
                      <span className="text-[10px] bg-lime-600 text-white font-bold px-2 py-0.5 rounded-full">
                        OBRIGATÓRIO
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    {choice.choiceItems
                      .filter((ci) => ci.enabled)
                      .map((ci) => {
                        const additionalPrice = ci.variations[0]?.additionalPrice || 0
                        const choiceSelection = modalSelectedChoices.find((c) => c.choiceId === choice.id)
                        const isItemSelected = choiceSelection?.items.some((i) => i.itemId === ci.id) || false

                        return (
                          <label
                            key={ci.id}
                            className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer select-none ${isItemSelected
                                ? "border-lime-600 bg-lime-50/20 text-lime-900"
                                : "border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50/50"
                              }`}
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type={choice.maxChoices === 1 ? "radio" : "checkbox"}
                                name={`choice-group-${choice.id}`}
                                checked={isItemSelected}
                                onChange={(e) => toggleModalChoiceItem(choice, ci, e.target.checked)}
                                className="accent-lime-600 size-4"
                              />
                              <span className="text-xs font-bold">{ci.name}</span>
                            </div>
                            {additionalPrice > 0 && (
                              <span className="text-xs font-extrabold text-neutral-600">
                                + {formatPrice(additionalPrice)}
                              </span>
                            )}
                          </label>
                        )
                      })}
                  </div>
                </div>
              ))}

              {/* Special details notes text area */}
              <div className="space-y-2">
                <span className="text-xs font-black text-neutral-800 uppercase tracking-wider block">Observações</span>
                <textarea
                  placeholder="Alguma restrição alimentar? Ex: Sem cebola, molho à parte..."
                  value={modalNotes}
                  onChange={(e) => setModalNotes(e.target.value)}
                  maxLength={140}
                  className="w-full h-20 p-3 rounded-xl border border-neutral-200 bg-white text-xs outline-none focus:ring-2 focus:ring-lime-600/35 focus:border-lime-600 transition-all font-semibold resize-none"
                />
                <span className="text-[10px] text-neutral-400 font-bold block text-right">
                  {modalNotes.length}/140 caracteres
                </span>
              </div>
            </div>

            {/* Sticky footer for Add action */}
            <div className="p-4 border-t border-neutral-100 bg-neutral-50/60 shrink-0 flex items-center justify-between gap-4">
              {/* Main item qty adjustments */}
              <div className="flex items-center gap-3 border border-neutral-200 rounded-xl p-1 bg-white shadow-sm">
                <button
                  onClick={() => setModalQuantity((q) => Math.max(1, q - 1))}
                  className="size-8 flex items-center justify-center text-neutral-600 hover:text-neutral-900 transition-colors"
                >
                  <Minus className="size-4" />
                </button>
                <span className="text-sm font-extrabold w-6 text-center">{modalQuantity}</span>
                <button
                  onClick={() => setModalQuantity((q) => q + 1)}
                  className="size-8 flex items-center justify-center text-neutral-600 hover:text-neutral-900 transition-colors"
                >
                  <Plus className="size-4" />
                </button>
              </div>

              {/* Add CTA */}
              <button
                onClick={addModalItemToCart}
                className="flex-1 h-11 bg-lime-600 hover:bg-lime-700 text-white font-extrabold rounded-xl transition-all shadow-md shadow-lime-600/25 flex items-center justify-between px-5 text-xs uppercase tracking-wider"
              >
                <span>Adicionar</span>
                <span>{formatPrice(calculateModalItemPrice() * modalQuantity)}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. FLOATING MOBILE CART TRIGGER (Mobile Only) */}
      {cart.length > 0 && (
        <div className="lg:hidden fixed bottom-6 left-0 right-0 px-4 z-40 animate-in slide-in-from-bottom-8 duration-300">
          <button
            onClick={() => setIsMobileCartOpen(true)}
            className="w-full h-14 bg-lime-600 hover:bg-lime-700 text-white font-extrabold rounded-2xl transition-all shadow-lg shadow-lime-600/35 flex items-center justify-between px-6 active:scale-98"
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="size-5" />
              <span className="text-xs uppercase tracking-wider">Ver sacola</span>
              <span className="bg-lime-700/50 size-5.5 rounded-full flex items-center justify-center text-[10px] font-bold">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            </div>
            <span className="font-extrabold text-sm">{formatPrice(calculateCartTotal())}</span>
          </button>
        </div>
      )}

      {/* 8. MOBILE CART DRAWER (Mobile Only overlay) */}
      {isMobileCartOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex items-end justify-center bg-neutral-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full bg-white rounded-t-3xl border-t border-neutral-100 flex flex-col max-h-[85vh] animate-in slide-in-from-bottom-full duration-300">
            {/* Drawer Header */}
            <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="size-5 text-lime-600" />
                <span className="font-black text-neutral-800 uppercase tracking-tight text-sm">Sua sacola</span>
              </div>
              <button
                onClick={() => setIsMobileCartOpen(false)}
                className="size-8 bg-neutral-100 text-neutral-500 rounded-full flex items-center justify-center"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Scrollable list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 divide-y divide-neutral-100">
              {cart.map((cartItem) => {
                const basePrice = cartItem.selectedVariation.price
                const choiceTotal = cartItem.selectedChoices.reduce((sum, c) => {
                  return sum + c.items.reduce((itemSum, item) => itemSum + item.additionalPrice, 0)
                }, 0)
                const itemUnitTotal = basePrice + choiceTotal

                return (
                  <div key={cartItem.cartId} className="pt-3 first:pt-0 space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <span className="font-black text-neutral-800 text-xs">
                          {cartItem.quantity}x {cartItem.item.name}
                        </span>
                        <span className="block text-neutral-400 font-bold text-[10px] uppercase mt-0.5">
                          {cartItem.selectedVariation.name}
                        </span>

                        {cartItem.selectedChoices.length > 0 && (
                          <div className="text-[10px] text-neutral-500 space-y-0.5 mt-1">
                            {cartItem.selectedChoices.map((choice) => (
                              <div key={choice.choiceId}>
                                <span className="font-semibold">{choice.choiceName}: </span>
                                {choice.items.map((i) => i.itemName).join(", ")}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="font-extrabold text-neutral-800 text-xs">
                          {formatPrice(itemUnitTotal * cartItem.quantity)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 border border-neutral-200 rounded-lg p-0.5">
                        <button
                          onClick={() => updateCartQuantity(cartItem.cartId, -1)}
                          className="size-5 flex items-center justify-center text-neutral-500"
                        >
                          <Minus className="size-3" />
                        </button>
                        <span className="text-xs font-bold w-4 text-center">{cartItem.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(cartItem.cartId, 1)}
                          className="size-5 flex items-center justify-center text-neutral-500"
                        >
                          <Plus className="size-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeCartItem(cartItem.cartId)}
                        className="text-xs font-bold text-red-500 flex items-center gap-1"
                      >
                        <Trash2 className="size-3" />
                        Remover
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Calculations & Checkout */}
            <div className="p-4 border-t border-neutral-100 bg-neutral-50/50 space-y-3">
              {/* CEP Calculator */}
              <form onSubmit={handleCalculateCep} className="flex gap-2">
                <input
                  type="text"
                  maxLength={8}
                  placeholder="CEP de entrega..."
                  value={cep}
                  onChange={(e) => setCep(e.target.value.replace(/\D/g, ""))}
                  className="flex-1 h-8 px-3 rounded-lg border border-neutral-200 bg-white text-xs outline-none"
                />
                <button
                  type="submit"
                  disabled={cep.length < 8}
                  className="h-8 px-3 bg-white border border-neutral-200 text-xs font-bold rounded-lg"
                >
                  {calculatingCep ? "Calculando..." : "Calcular"}
                </button>
              </form>

              {deliveryFee !== null && (
                <p className="text-[11px] font-bold text-emerald-600">
                  Entrega: {deliveryFee === 0 ? "Grátis" : formatPrice(deliveryFee)}
                </p>
              )}

              {/* Totals */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-neutral-500 font-bold">
                  <span>Subtotal</span>
                  <span>{formatPrice(calculateCartSubtotal())}</span>
                </div>
                {activeCoupon && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Desconto</span>
                    <span>-{formatPrice(calculateDiscount())}</span>
                  </div>
                )}
                <div className="flex justify-between text-neutral-800 font-extrabold text-sm border-t border-dashed border-neutral-100 pt-2">
                  <span>Total</span>
                  <span>{formatPrice(calculateCartTotal())}</span>
                </div>
              </div>

              {/* Coupon form */}
              <form onSubmit={handleApplyCoupon} className="flex gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Cupom..."
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 h-7 px-2 rounded border border-neutral-200 bg-white text-[10px]"
                />
                <button type="submit" className="h-7 px-3 bg-neutral-800 text-white text-[10px] font-bold rounded">
                  Aplicar
                </button>
              </form>

              <button
                onClick={() => {
                  setIsMobileCartOpen(false)
                  handleOpenCheckout()
                }}
                disabled={isCheckoutLoading}
                className="w-full h-11 bg-lime-600 hover:bg-lime-700 text-white font-extrabold rounded-xl uppercase tracking-wider text-xs flex items-center justify-center mt-2 shadow-md"
              >
                {isCheckoutLoading ? "Processando..." : "Finalizar pedido"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8.5. CHECKOUT MODAL WINDOW */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full border border-neutral-100 shadow-2xl animate-in scale-in duration-200 relative my-8 text-neutral-800">
            <button
              onClick={() => setIsCheckoutModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50 rounded-full transition-all"
            >
              <X className="size-5" />
            </button>

            <h3 className="text-xl font-black text-neutral-800 tracking-tight uppercase mb-6">Finalizar Pedido</h3>

            <form onSubmit={handleCheckoutSubmit} className="space-y-4">
              {/* Customer Name */}
              <div>
                <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
                  Seu Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: João Silva"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-neutral-200 bg-neutral-50 text-sm font-semibold outline-none focus:border-lime-600 focus:bg-white transition-all text-neutral-800"
                />
              </div>

              {/* Customer Phone */}
              <div>
                <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
                  Seu Telefone / WhatsApp *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="Ex: (11) 99999-9999"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-neutral-200 bg-neutral-50 text-sm font-semibold outline-none focus:border-lime-600 focus:bg-white transition-all text-neutral-800"
                />
              </div>

              {/* Delivery Type */}
              <div>
                <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
                  Método de Entrega
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "delivery", label: "Entrega" },
                    { id: "takeaway", label: "Retirada" },
                    { id: "table", label: "Mesa" },
                  ].map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setDeliveryType(option.id as any)}
                      className={`h-11 rounded-xl text-xs font-bold border transition-all ${deliveryType === option.id
                          ? "border-lime-600 bg-lime-50 text-lime-700 font-extrabold"
                          : "border-neutral-200 hover:border-neutral-300 text-neutral-600"
                        }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Address (conditional for delivery) */}
              {deliveryType === "delivery" && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                  <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
                    Endereço de Entrega *
                  </label>
                  <textarea
                    required
                    placeholder="Rua, número, bairro, complemento..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={2}
                    className="w-full p-4 rounded-xl border border-neutral-200 bg-neutral-50 text-sm font-semibold outline-none focus:border-lime-600 focus:bg-white transition-all resize-none text-neutral-800"
                  />
                </div>
              )}

              {/* Table Number (conditional for table) */}
              {deliveryType === "table" && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                  <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
                    Número da Mesa *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 04"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border border-neutral-200 bg-neutral-50 text-sm font-semibold outline-none focus:border-lime-600 focus:bg-white transition-all text-neutral-800"
                  />
                </div>
              )}

              {/* Payment Method */}
              <div>
                <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
                  Forma de Pagamento
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-neutral-200 bg-neutral-50 text-sm font-semibold outline-none focus:border-lime-600 focus:bg-white transition-all cursor-pointer text-neutral-800"
                >
                  <option value="Pix">Pix</option>
                  <option value="Cartão de Crédito">Cartão de Crédito</option>
                  <option value="Cartão de Débito">Cartão de Débito</option>
                  <option value="Dinheiro">Dinheiro</option>
                </select>
              </div>

              {/* Submitting Button */}
              <button
                type="submit"
                disabled={isCheckoutLoading}
                className="w-full h-12 bg-lime-600 hover:bg-lime-700 text-white font-extrabold rounded-2xl transition-all shadow-md shadow-lime-600/25 flex items-center justify-center gap-2 mt-6 uppercase tracking-wider text-xs"
              >
                {isCheckoutLoading ? (
                  <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  `Confirmar e Enviar Pedido • ${formatPrice(calculateCartTotal())}`
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 9. SUCCESSFUL ORDER DIALOG (POPUP CONFIRMATION) */}
      {isSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 md:p-8 text-center max-w-sm w-full border border-neutral-100 shadow-2xl animate-in scale-in duration-200">
            <div className="size-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-100">
              <CheckCircle className="size-10" />
            </div>
            <h3 className="text-lg font-black text-neutral-800 tracking-tight uppercase">Pedido enviado!</h3>
            <p className="text-neutral-500 text-xs leading-relaxed mt-2">
              Seu pedido foi encaminhado com sucesso para o restaurante. Você pode acompanhar o status na sua tela de pedidos.
            </p>
            <div className="mt-6 space-y-2">
              <Link
                href="/pedidos"
                className="w-full h-11 bg-lime-600 hover:bg-lime-700 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center text-xs uppercase"
              >
                Acompanhar Pedido
              </Link>
              <button
                onClick={() => setIsSuccess(false)}
                className="w-full h-11 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold rounded-xl transition-all text-xs uppercase"
              >
                Voltar ao Cardápio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
