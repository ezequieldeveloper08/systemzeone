"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useProperties } from "../hooks/useProperties"
import { Property, PropertyType, PropertyPurpose, PropertyStatus, FurnishingType, PropertyImage, PropertyVideo, CreatePropertyInput } from "../types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  ChevronLeft,
  Upload,
  X,
  Plus,
  Home,
  MapPin,
  Maximize,
  DollarSign,
  Building,
  Images,
  Tag,
  AlertCircle,
  Check
} from "lucide-react"
import Link from "next/link"

interface PropertyFormProps {
  propertyId?: string
}

export function PropertyForm({ propertyId }: PropertyFormProps) {
  const router = useRouter()
  const { properties, createProperty, updateProperty, uploadPropertyImage } = useProperties()

  const isEdit = !!propertyId
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState<string>("identificacao")

  // TAB 1: IDENTIFICAÇÃO
  const [code, setCode] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [slug, setSlug] = useState("")
  const [type, setType] = useState<PropertyType>("apartment")
  const [purpose, setPurpose] = useState<PropertyPurpose>("sale")
  const [status, setStatus] = useState<PropertyStatus>("draft")

  // TAB 2: LOCALIZAÇÃO
  const [zipCode, setZipCode] = useState("")
  const [street, setStreet] = useState("")
  const [number, setNumber] = useState("")
  const [complement, setComplement] = useState("")
  const [neighborhood, setNeighborhood] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [country, setCountry] = useState("Brasil")
  const [latitude, setLatitude] = useState<string>("")
  const [longitude, setLongitude] = useState<string>("")
  const [hideExactAddress, setHideExactAddress] = useState(false)

  // TAB 3: ÁREAS E CÔMODOS
  const [totalArea, setTotalArea] = useState<string>("")
  const [usableArea, setUsableArea] = useState<string>("")
  const [landArea, setLandArea] = useState<string>("")
  const [bedrooms, setBedrooms] = useState<number>(0)
  const [suites, setSuites] = useState<number>(0)
  const [bathrooms, setBathrooms] = useState<number>(0)
  const [parkingSpaces, setParkingSpaces] = useState<number>(0)
  const [livingRooms, setLivingRooms] = useState<number>(0)
  const [kitchens, setKitchens] = useState<number>(0)

  // TAB 4: DETALHES E REGRAS
  const [floor, setFloor] = useState<string>("")
  const [totalFloors, setTotalFloors] = useState<string>("")
  const [constructionYear, setConstructionYear] = useState<string>("")
  const [furnishing, setFurnishing] = useState<FurnishingType>("unfurnished")
  const [acceptsPets, setAcceptsPets] = useState(false)
  const [accessible, setAccessible] = useState(false)
  const [petsAllowed, setPetsAllowed] = useState(false)
  const [childrenAllowed, setChildrenAllowed] = useState(true)
  const [smokingAllowed, setSmokingAllowed] = useState(false)

  // TAB 5: PREÇOS
  const [rentPrice, setRentPrice] = useState<string>("")
  const [salePrice, setSalePrice] = useState<string>("")
  const [condominiumFee, setCondominiumFee] = useState<string>("")
  const [propertyTax, setPropertyTax] = useState<string>("")
  const [fireInsurance, setFireInsurance] = useState<string>("")
  const [serviceFee, setServiceFee] = useState<string>("")

  // TAB 6: CARACTERÍSTICAS (Checkbox array)
  const [features, setFeatures] = useState({
    balcony: false,
    airConditioning: false,
    builtInCabinets: false,
    serviceArea: false,
    backyard: false,
    garden: false,
    pool: false,
    privatePool: false,
    barbecue: false,
    homeOffice: false,
    closet: false,
    bathtub: false,
    elevator: false,
  })

  // TAB 7: CONDOMÍNIO
  const [condoName, setCondoName] = useState("")
  const [condoFeatures, setCondoFeatures] = useState({
    pool: false,
    gym: false,
    playground: false,
    partyRoom: false,
    gameRoom: false,
    sportsCourt: false,
    barbecue: false,
    coworking: false,
    laundry: false,
    elevator: false,
    concierge: false,
    concierge24h: false,
    gatedCommunity: false,
    garden: false,
    sauna: false,
    petArea: false,
    bikeRack: false,
  })

  // TAB 8: MÍDIA E RESPONSÁVEIS
  const [images, setImages] = useState<PropertyImage[]>([])
  const [imageUrlInput, setImageUrlInput] = useState("")
  const [coverImage, setCoverImage] = useState<string>("")
  const [virtualTourUrl, setVirtualTourUrl] = useState("")
  const [ownerName, setOwnerName] = useState("")
  const [realtorName, setRealtorName] = useState("")
  const [agencyName, setAgencyName] = useState("")
  const [seoTitle, setSeoTitle] = useState("")
  const [seoDescription, setSeoDescription] = useState("")

  // Pre-fill values when editing
  useEffect(() => {
    if (isEdit && properties.length > 0) {
      const prop = properties.find((p) => p.id === propertyId)
      if (prop) {
        setCode(prop.code || "")
        setTitle(prop.title)
        setDescription(prop.description || "")
        setSlug(prop.slug || "")
        setType(prop.type)
        setPurpose(prop.purpose)
        setStatus(prop.status)

        if (prop.address) {
          setZipCode(prop.address.zipCode || "")
          setStreet(prop.address.street)
          setNumber(prop.address.number || "")
          setComplement(prop.address.complement || "")
          setNeighborhood(prop.address.neighborhood)
          setCity(prop.address.city)
          setState(prop.address.state)
          setCountry(prop.address.country || "Brasil")
          setLatitude(prop.address.latitude ? String(prop.address.latitude) : "")
          setLongitude(prop.address.longitude ? String(prop.address.longitude) : "")
          setHideExactAddress(!!prop.address.hideExactAddress)
        }

        if (prop.area) {
          setTotalArea(prop.area.total ? String(prop.area.total) : "")
          setUsableArea(prop.area.usable ? String(prop.area.usable) : "")
          setLandArea(prop.area.land ? String(prop.area.land) : "")
        }

        if (prop.rooms) {
          setBedrooms(prop.rooms.bedrooms)
          setSuites(prop.rooms.suites)
          setBathrooms(prop.rooms.bathrooms)
          setParkingSpaces(prop.rooms.parkingSpaces)
          setLivingRooms(prop.rooms.livingRooms || 0)
          setKitchens(prop.rooms.kitchens || 0)
        }

        if (prop.details) {
          setFloor(prop.details.floor ? String(prop.details.floor) : "")
          setTotalFloors(prop.details.totalFloors ? String(prop.details.totalFloors) : "")
          setConstructionYear(prop.details.constructionYear ? String(prop.details.constructionYear) : "")
          setFurnishing(prop.details.furnishing)
          setAcceptsPets(!!prop.details.acceptsPets)
          setAccessible(!!prop.details.accessible)
        }

        if (prop.rules) {
          setPetsAllowed(!!prop.rules.petsAllowed)
          setChildrenAllowed(prop.rules.childrenAllowed !== false)
          setSmokingAllowed(!!prop.rules.smokingAllowed)
        }

        if (prop.pricing) {
          setRentPrice(prop.pricing.rentPrice ? String(prop.pricing.rentPrice) : "")
          setSalePrice(prop.pricing.salePrice ? String(prop.pricing.salePrice) : "")
          setCondominiumFee(prop.pricing.condominiumFee ? String(prop.pricing.condominiumFee) : "")
          setPropertyTax(prop.pricing.propertyTax ? String(prop.pricing.propertyTax) : "")
          setFireInsurance(prop.pricing.fireInsurance ? String(prop.pricing.fireInsurance) : "")
          setServiceFee(prop.pricing.serviceFee ? String(prop.pricing.serviceFee) : "")
        }

        if (prop.features) {
          setFeatures({
            balcony: !!prop.features.balcony,
            airConditioning: !!prop.features.airConditioning,
            builtInCabinets: !!prop.features.builtInCabinets,
            serviceArea: !!prop.features.serviceArea,
            backyard: !!prop.features.backyard,
            garden: !!prop.features.garden,
            pool: !!prop.features.pool,
            privatePool: !!prop.features.privatePool,
            barbecue: !!prop.features.barbecue,
            homeOffice: !!prop.features.homeOffice,
            closet: !!prop.features.closet,
            bathtub: !!prop.features.bathtub,
            elevator: !!prop.features.elevator,
          })
        }

        if (prop.condominium) {
          setCondoName(prop.condominium.name || "")
          if (prop.condominium.features) {
            setCondoFeatures({
              pool: !!prop.condominium.features.pool,
              gym: !!prop.condominium.features.gym,
              playground: !!prop.condominium.features.playground,
              partyRoom: !!prop.condominium.features.partyRoom,
              gameRoom: !!prop.condominium.features.gameRoom,
              sportsCourt: !!prop.condominium.features.sportsCourt,
              barbecue: !!prop.condominium.features.barbecue,
              coworking: !!prop.condominium.features.coworking,
              laundry: !!prop.condominium.features.laundry,
              elevator: !!prop.condominium.features.elevator,
              concierge: !!prop.condominium.features.concierge,
              concierge24h: !!prop.condominium.features.concierge24h,
              gatedCommunity: !!prop.condominium.features.gatedCommunity,
              garden: !!prop.condominium.features.garden,
              sauna: !!prop.condominium.features.sauna,
              petArea: !!prop.condominium.features.petArea,
              bikeRack: !!prop.condominium.features.bikeRack,
            })
          }
        }

        if (prop.media) {
          setImages(prop.media.images || [])
          setCoverImage(prop.media.cover || "")
          setVirtualTourUrl(prop.media.virtualTourUrl || "")
        }

        if (prop.owner) setOwnerName(prop.owner.name || "")
        if (prop.realtor) setRealtorName(prop.realtor.name || "")
        if (prop.agency) setAgencyName(prop.agency.name || "")
        if (prop.seo) {
          setSeoTitle(prop.seo.title || "")
          setSeoDescription(prop.seo.description || "")
        }
      }
    }
  }, [isEdit, propertyId, properties])

  const handleAddImageUrl = (e: React.MouseEvent) => {
    e.preventDefault()
    if (imageUrlInput.trim()) {
      const isFirst = images.length === 0
      const newImg: PropertyImage = {
        id: crypto.randomUUID ? crypto.randomUUID() : `img-${Date.now()}`,
        url: imageUrlInput.trim(),
        position: images.length + 1,
        isCover: isFirst,
      }
      setImages((prev) => [...prev, newImg])
      if (isFirst) {
        setCoverImage(imageUrlInput.trim())
      }
      setImageUrlInput("")
    }
  }

  const handleRemoveImage = (idToRemove: string) => {
    const updated = images.filter((img) => img.id !== idToRemove)
    setImages(updated)
    // If deleted image was cover, set first remaining image as cover
    if (images.find((img) => img.id === idToRemove)?.isCover && updated.length > 0) {
      updated[0].isCover = true
      setCoverImage(updated[0].url)
    }
  }

  const handleSetCoverImage = (idToCover: string) => {
    const updated = images.map((img) => {
      if (img.id === idToCover) {
        setCoverImage(img.url)
        return { ...img, isCover: true }
      }
      return { ...img, isCover: false }
    })
    setImages(updated)
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsSubmitting(true)
    setError(null)

    try {
      const uploaded: PropertyImage[] = []
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const { url } = await uploadPropertyImage(file)
        const isFirst = images.length === 0 && uploaded.length === 0
        uploaded.push({
          id: crypto.randomUUID ? crypto.randomUUID() : `img-${Date.now()}-${i}`,
          url,
          position: images.length + i + 1,
          isCover: isFirst,
        })
        if (isFirst) {
          setCoverImage(url)
        }
      }
      setImages((prev) => [...prev, ...uploaded])
    } catch (err: any) {
      setError(err.message || "Erro ao fazer upload das imagens.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!title.trim()) {
      setError("O título do imóvel é obrigatório.")
      return
    }
    if (!street.trim() || !neighborhood.trim() || !city.trim() || !state.trim()) {
      setError("Endereço completo (Rua, Bairro, Cidade, Estado) é obrigatório.")
      return
    }

    setIsSubmitting(true)

    const payload: CreatePropertyInput = {
      code: code || undefined,
      title,
      description: description || undefined,
      slug: slug || undefined,
      type,
      purpose,
      status,
      address: {
        zipCode: zipCode || undefined,
        street,
        number: number || undefined,
        complement: complement || undefined,
        neighborhood,
        city,
        state,
        country,
        latitude: latitude ? Number(latitude) : undefined,
        longitude: longitude ? Number(longitude) : undefined,
        hideExactAddress,
      },
      area: {
        total: totalArea ? Number(totalArea) : undefined,
        usable: usableArea ? Number(usableArea) : undefined,
        land: landArea ? Number(landArea) : undefined,
      },
      rooms: {
        bedrooms: Number(bedrooms),
        suites: Number(suites),
        bathrooms: Number(bathrooms),
        parkingSpaces: Number(parkingSpaces),
        livingRooms: livingRooms ? Number(livingRooms) : undefined,
        kitchens: kitchens ? Number(kitchens) : undefined,
      },
      details: {
        floor: floor ? Number(floor) : undefined,
        totalFloors: totalFloors ? Number(totalFloors) : undefined,
        constructionYear: constructionYear ? Number(constructionYear) : undefined,
        furnishing,
        acceptsPets,
        accessible,
      },
      pricing: {
        rentPrice: rentPrice ? Number(rentPrice) : undefined,
        salePrice: salePrice ? Number(salePrice) : undefined,
        condominiumFee: condominiumFee ? Number(condominiumFee) : undefined,
        propertyTax: propertyTax ? Number(propertyTax) : undefined,
        fireInsurance: fireInsurance ? Number(fireInsurance) : undefined,
        serviceFee: serviceFee ? Number(serviceFee) : undefined,
      },
      features,
      condominium: {
        name: condoName || undefined,
        features: condoFeatures,
      },
      rules: {
        petsAllowed,
        childrenAllowed,
        smokingAllowed,
      },
      media: {
        cover: coverImage || undefined,
        images,
        virtualTourUrl: virtualTourUrl || undefined,
      },
      commercial: {
        exclusive: false,
        featured: false,
        newListing: true,
      },
      owner: ownerName ? { id: crypto.randomUUID ? crypto.randomUUID() : `own-${Date.now()}`, name: ownerName } : undefined,
      realtor: realtorName ? { id: crypto.randomUUID ? crypto.randomUUID() : `ret-${Date.now()}`, name: realtorName } : undefined,
      agency: agencyName ? { id: crypto.randomUUID ? crypto.randomUUID() : `age-${Date.now()}`, name: agencyName } : undefined,
      seo: seoTitle || seoDescription ? { title: seoTitle || undefined, description: seoDescription || undefined } : undefined,
    }

    try {
      if (isEdit && propertyId) {
        await updateProperty(propertyId, payload)
      } else {
        await createProperty(payload)
      }
      router.push("/admin/real-estate")
    } catch (err: any) {
      setError(err.message || "Erro ao salvar o imóvel.")
      setIsSubmitting(false)
    }
  }

  const tabs = [
    { id: "identificacao", label: "Identificação", icon: Home },
    { id: "localizacao", label: "Localização", icon: MapPin },
    { id: "areas", label: "Áreas e Cômodos", icon: Maximize },
    { id: "precos", label: "Preços", icon: DollarSign },
    { id: "caracteristicas", label: "Características", icon: Tag },
    { id: "condominio", label: "Condomínio", icon: Building },
    { id: "midia", label: "Mídia e SEO", icon: Images },
  ]

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-5xl mx-auto p-6">
      {/* FORM TOP BAR */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-neutral-200 pb-5 dark:border-neutral-800">
        <div className="flex items-center gap-3">
          <Link href="/admin/real-estate" className="rounded-lg border border-neutral-200 p-1.5 text-neutral-500 shadow-2xs hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800">
            <ChevronLeft className="size-4" />
          </Link>
          <div>
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Voltar ao portfólio
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
              {isEdit ? `Editar: ${title || "Imóvel"}` : "Novo Imóvel"}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button asChild type="button" variant="outline" className="h-9 text-xs font-semibold px-4 rounded-lg">
            <Link href="/admin/real-estate">Descartar</Link>
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-9 text-xs font-semibold px-4 rounded-lg bg-neutral-950 text-white dark:bg-white dark:text-neutral-950"
          >
            {isSubmitting ? (
              <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              "Salvar Imóvel"
            )}
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3.5 text-sm text-red-600 dark:bg-red-950/20 dark:text-red-400">
          <AlertCircle className="size-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* TABS HEADER */}
      <div className="flex flex-wrap gap-1 border-b border-neutral-200 dark:border-neutral-800">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
                isActive
                  ? "border-neutral-900 text-neutral-900 dark:border-white dark:text-white"
                  : "border-transparent text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
              }`}
            >
              <Icon className="size-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* TAB CONTENT CARDS */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-950">
        
        {/* IDENTIFICAÇÃO */}
        {activeTab === "identificacao" && (
          <div className="space-y-6">
            <h3 className="font-bold text-lg text-neutral-900 dark:text-neutral-50">Dados Principais</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="title">Título do Anúncio *</Label>
                <Input id="title" placeholder="Ex: Sobrado Mobiliado com Piscina em Alphaville" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="code">Código de Referência</Label>
                <Input id="code" placeholder="Ex: IM-1002" value={code} onChange={(e) => setCode(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="slug">Slug (URL amigável)</Label>
                <Input id="slug" placeholder="Ex: sobrado-mobiliado-alphaville" value={slug} onChange={(e) => setSlug(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="type">Tipo do Imóvel</Label>
                <select
                  id="type"
                  value={type}
                  onChange={(e) => setType(e.target.value as PropertyType)}
                  className="w-full h-10 px-3 rounded-md border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950 text-sm focus:outline-hidden"
                >
                  <option value="apartment">Apartamento</option>
                  <option value="house">Casa</option>
                  <option value="condo_house">Casa em Condomínio</option>
                  <option value="studio">Studio</option>
                  <option value="kitnet">Kitnet</option>
                  <option value="loft">Loft</option>
                  <option value="penthouse">Cobertura (Penthouse)</option>
                  <option value="commercial">Comercial</option>
                  <option value="land">Terreno</option>
                  <option value="farm">Chácara / Sítio</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="purpose">Finalidade</Label>
                <select
                  id="purpose"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value as PropertyPurpose)}
                  className="w-full h-10 px-3 rounded-md border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950 text-sm focus:outline-hidden"
                >
                  <option value="sale">Venda</option>
                  <option value="rent">Locação</option>
                  <option value="rent_and_sale">Venda ou Locação</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="status">Status do Anúncio</Label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as PropertyStatus)}
                  className="w-full h-10 px-3 rounded-md border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950 text-sm focus:outline-hidden"
                >
                  <option value="draft">Rascunho</option>
                  <option value="active">Ativo (Anunciado)</option>
                  <option value="inactive">Inativo</option>
                  <option value="rented">Alugado</option>
                  <option value="sold">Vendido</option>
                  <option value="reserved">Reservado</option>
                </select>
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="description">Descrição Detalhada</Label>
                <Textarea id="description" placeholder="Descreva os cômodos, áreas de lazer, proximidade com metrô, etc." value={description} onChange={(e) => setDescription(e.target.value)} rows={6} />
              </div>
            </div>
          </div>
        )}

        {/* LOCALIZAÇÃO */}
        {activeTab === "localizacao" && (
          <div className="space-y-6">
            <h3 className="font-bold text-lg text-neutral-900 dark:text-neutral-50">Localização do Imóvel</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="zipCode">CEP</Label>
                <Input id="zipCode" placeholder="Ex: 01311-200" value={zipCode} onChange={(e) => setZipCode(e.target.value)} />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="street">Rua / Logradouro *</Label>
                <Input id="street" placeholder="Ex: Avenida Paulista" value={street} onChange={(e) => setStreet(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="number">Número</Label>
                <Input id="number" placeholder="Ex: 1000" value={number} onChange={(e) => setNumber(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="complement">Complemento (Ap, Bloco...)</Label>
                <Input id="complement" placeholder="Ex: Ap 12A Bloco B" value={complement} onChange={(e) => setComplement(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="neighborhood">Bairro *</Label>
                <Input id="neighborhood" placeholder="Ex: Bela Vista" value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="city">Cidade *</Label>
                <Input id="city" placeholder="Ex: São Paulo" value={city} onChange={(e) => setCity(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="state">Estado (UF) *</Label>
                <Input id="state" placeholder="Ex: SP" value={state} onChange={(e) => setState(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="country">País</Label>
                <Input id="country" placeholder="Ex: Brasil" value={country} onChange={(e) => setCountry(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="latitude">Latitude</Label>
                <Input id="latitude" type="number" step="any" placeholder="Ex: -23.5614" value={latitude} onChange={(e) => setLatitude(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="longitude">Longitude</Label>
                <Input id="longitude" type="number" step="any" placeholder="Ex: -46.6558" value={longitude} onChange={(e) => setLongitude(e.target.value)} />
              </div>
              <div className="md:col-span-3 flex items-center gap-2 pt-2">
                <Checkbox id="hideExactAddress" checked={hideExactAddress} onCheckedChange={(checked) => setHideExactAddress(!!checked)} />
                <Label htmlFor="hideExactAddress" className="cursor-pointer">Ocultar endereço exato do público (exibir apenas bairro/cidade)</Label>
              </div>
            </div>
          </div>
        )}

        {/* ÁREAS E CÔMODOS */}
        {activeTab === "areas" && (
          <div className="space-y-6">
            <h3 className="font-bold text-lg text-neutral-900 dark:text-neutral-50">Medidas e Compartimentos</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-neutral-100 pb-5 dark:border-neutral-800">
              <div className="space-y-1.5">
                <Label htmlFor="totalArea">Área Total (m²)</Label>
                <Input id="totalArea" type="number" placeholder="Ex: 250" value={totalArea} onChange={(e) => setTotalArea(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="usableArea">Área Útil / Privativa (m²)</Label>
                <Input id="usableArea" type="number" placeholder="Ex: 180" value={usableArea} onChange={(e) => setUsableArea(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="landArea">Área do Terreno (m²)</Label>
                <Input id="landArea" type="number" placeholder="Ex: 360" value={landArea} onChange={(e) => setLandArea(e.target.value)} />
              </div>
            </div>

            <h4 className="font-bold text-md text-neutral-800 dark:text-neutral-200">Cômodos do Imóvel</h4>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="bedrooms">Quartos</Label>
                <Input id="bedrooms" type="number" min="0" value={bedrooms} onChange={(e) => setBedrooms(Number(e.target.value))} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="suites">Suítes</Label>
                <Input id="suites" type="number" min="0" value={suites} onChange={(e) => setSuites(Number(e.target.value))} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bathrooms">Banheiros</Label>
                <Input id="bathrooms" type="number" min="0" value={bathrooms} onChange={(e) => setBathrooms(Number(e.target.value))} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="parkingSpaces">Vagas Garagem</Label>
                <Input id="parkingSpaces" type="number" min="0" value={parkingSpaces} onChange={(e) => setParkingSpaces(Number(e.target.value))} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="livingRooms">Salas</Label>
                <Input id="livingRooms" type="number" min="0" value={livingRooms} onChange={(e) => setLivingRooms(Number(e.target.value))} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="kitchens">Cozinhas</Label>
                <Input id="kitchens" type="number" min="0" value={kitchens} onChange={(e) => setKitchens(Number(e.target.value))} />
              </div>
            </div>
          </div>
        )}

        {/* PREÇOS, DETALHES E REGRAS */}
        {activeTab === "precos" && (
          <div className="space-y-6">
            <h3 className="font-bold text-lg text-neutral-900 dark:text-neutral-50">Valores Comerciais</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-neutral-100 pb-5 dark:border-neutral-800">
              <div className="space-y-1.5">
                <Label htmlFor="salePrice">Preço de Venda (R$)</Label>
                <Input id="salePrice" type="number" placeholder="Ex: 750000" value={salePrice} onChange={(e) => setSalePrice(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="rentPrice">Preço de Locação (R$ / mês)</Label>
                <Input id="rentPrice" type="number" placeholder="Ex: 3500" value={rentPrice} onChange={(e) => setRentPrice(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="condominiumFee">Condomínio (R$)</Label>
                <Input id="condominiumFee" type="number" placeholder="Ex: 600" value={condominiumFee} onChange={(e) => setCondominiumFee(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="propertyTax">IPTU (R$)</Label>
                <Input id="propertyTax" type="number" placeholder="Ex: 120" value={propertyTax} onChange={(e) => setPropertyTax(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="fireInsurance">Seguro Incêndio (R$)</Label>
                <Input id="fireInsurance" type="number" placeholder="Ex: 45" value={fireInsurance} onChange={(e) => setFireInsurance(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="serviceFee">Taxa de Serviço imobiliário (R$)</Label>
                <Input id="serviceFee" type="number" placeholder="Ex: 100" value={serviceFee} onChange={(e) => setServiceFee(e.target.value)} />
              </div>
            </div>

            <h3 className="font-bold text-lg text-neutral-900 dark:text-neutral-50 pt-2">Estrutura e Acabamento</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-neutral-100 pb-5 dark:border-neutral-800">
              <div className="space-y-1.5">
                <Label htmlFor="furnishing">Mobiliado</Label>
                <select
                  id="furnishing"
                  value={furnishing}
                  onChange={(e) => setFurnishing(e.target.value as FurnishingType)}
                  className="w-full h-10 px-3 rounded-md border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950 text-sm focus:outline-hidden"
                >
                  <option value="unfurnished">Sem mobília</option>
                  <option value="semi_furnished">Semi-mobiliado</option>
                  <option value="furnished">Mobiliado</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="floor">Número do Andar</Label>
                <Input id="floor" type="number" placeholder="Ex: 14" value={floor} onChange={(e) => setFloor(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="totalFloors">Total de Andares do Edifício</Label>
                <Input id="totalFloors" type="number" placeholder="Ex: 22" value={totalFloors} onChange={(e) => setTotalFloors(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="constructionYear">Ano de Construção</Label>
                <Input id="constructionYear" type="number" placeholder="Ex: 2015" value={constructionYear} onChange={(e) => setConstructionYear(e.target.value)} />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <Checkbox id="acceptsPets" checked={acceptsPets} onCheckedChange={(checked) => setAcceptsPets(!!checked)} />
                <Label htmlFor="acceptsPets" className="cursor-pointer">Aceita Animais (Ficha)</Label>
              </div>
              <div className="flex items-center gap-2 pt-6">
                <Checkbox id="accessible" checked={accessible} onCheckedChange={(checked) => setAccessible(!!checked)} />
                <Label htmlFor="accessible" className="cursor-pointer">Imóvel Acessível (PCD)</Label>
              </div>
            </div>

            <h3 className="font-bold text-lg text-neutral-900 dark:text-neutral-50 pt-2">Regras de Convivência</h3>
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <Checkbox id="petsAllowed" checked={petsAllowed} onCheckedChange={(checked) => setPetsAllowed(!!checked)} />
                <Label htmlFor="petsAllowed" className="cursor-pointer">Permite Pets</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="childrenAllowed" checked={childrenAllowed} onCheckedChange={(checked) => setChildrenAllowed(!!checked)} />
                <Label htmlFor="childrenAllowed" className="cursor-pointer">Permite Crianças</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="smokingAllowed" checked={smokingAllowed} onCheckedChange={(checked) => setSmokingAllowed(!!checked)} />
                <Label htmlFor="smokingAllowed" className="cursor-pointer">Permite Fumar</Label>
              </div>
            </div>
          </div>
        )}

        {/* CARACTERÍSTICAS */}
        {activeTab === "caracteristicas" && (
          <div className="space-y-6">
            <h3 className="font-bold text-lg text-neutral-900 dark:text-neutral-50">Lazer e Acessórios Internos</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.keys(features).map((key) => {
                const labelMap: Record<string, string> = {
                  balcony: "Varanda / Sacada",
                  airConditioning: "Ar Condicionado",
                  builtInCabinets: "Armários Embutidos",
                  serviceArea: "Área de Serviço",
                  backyard: "Quintal",
                  garden: "Jardim",
                  pool: "Piscina",
                  privatePool: "Piscina Privativa",
                  barbecue: "Churrasqueira",
                  homeOffice: "Home Office",
                  closet: "Closet",
                  bathtub: "Banheira",
                  elevator: "Elevador Privativo",
                }
                const checked = (features as any)[key]
                return (
                  <label key={key} className="flex items-center gap-2.5 cursor-pointer rounded-lg border border-neutral-100 p-3 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900">
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(val) => setFeatures((prev) => ({ ...prev, [key]: !!val }))}
                    />
                    <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      {labelMap[key] || key}
                    </span>
                  </label>
                )
              })}
            </div>
          </div>
        )}

        {/* CONDOMÍNIO */}
        {activeTab === "condominio" && (
          <div className="space-y-6">
            <h3 className="font-bold text-lg text-neutral-900 dark:text-neutral-50">Área de Lazer e Condomínio</h3>
            <div className="space-y-4">
              <div className="space-y-1.5 max-w-md">
                <Label htmlFor="condoName">Nome do Condomínio / Edifício</Label>
                <Input id="condoName" placeholder="Ex: Residencial Jardins da Paulista" value={condoName} onChange={(e) => setCondoName(e.target.value)} />
              </div>

              <h4 className="font-bold text-sm uppercase tracking-wider text-neutral-400 mt-4">
                Características do Condomínio
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.keys(condoFeatures).map((key) => {
                  const labelMap: Record<string, string> = {
                    pool: "Piscina Coletiva",
                    gym: "Academia / Fitness",
                    playground: "Playground",
                    partyRoom: "Salão de Festas",
                    gameRoom: "Salão de Jogos",
                    sportsCourt: "Quadra Esportiva",
                    barbecue: "Churrasqueira Coletiva",
                    coworking: "Coworking",
                    laundry: "Lavanderia Coletiva",
                    elevator: "Elevador Social",
                    concierge: "Portaria",
                    concierge24h: "Portaria 24h",
                    gatedCommunity: "Condomínio Fechado",
                    garden: "Áreas Verdes",
                    sauna: "Sauna",
                    petArea: "Área Pet",
                    bikeRack: "Bicicletário",
                  }
                  const checked = (condoFeatures as any)[key]
                  return (
                    <label key={key} className="flex items-center gap-2.5 cursor-pointer rounded-lg border border-neutral-100 p-3 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(val) => setCondoFeatures((prev) => ({ ...prev, [key]: !!val }))}
                      />
                      <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        {labelMap[key] || key}
                      </span>
                    </label>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* MÍDIA E RESPONSÁVEIS */}
        {activeTab === "midia" && (
          <div className="space-y-6">
            <h3 className="font-bold text-lg text-neutral-900 dark:text-neutral-50">Imagens do Anúncio</h3>
            <div className="space-y-4">
              
              {/* Dropzone */}
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-neutral-300 p-6 text-center dark:border-neutral-800 relative hover:border-neutral-400 dark:hover:border-neutral-700 transition-colors cursor-pointer">
                <Upload className="size-8 text-neutral-400 mb-2" />
                <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Arraste fotos ou clique aqui para fazer upload
                </p>
                <p className="text-[10px] text-neutral-400 mt-1">PNG, JPG ou WEBP até 10MB</p>
                <input
                  type="file"
                  id="file-upload"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                />
              </div>

              <div className="flex items-center gap-3 py-1 text-xs text-neutral-400">
                <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
                <span>OU ADICIONE POR URL</span>
                <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
              </div>

              <div className="flex w-full items-center gap-2">
                <Input placeholder="Cole a URL da foto (ex: https://images.unsplash.com/...)" value={imageUrlInput} onChange={(e) => setImageUrlInput(e.target.value)} />
                <Button type="button" onClick={handleAddImageUrl} className="h-10">Adicionar</Button>
              </div>

              {/* Grid of uploaded images */}
              {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4 pt-4">
                  {images.map((img) => (
                    <div key={img.id} className="group relative h-28 rounded-xl border border-neutral-200 bg-neutral-50 overflow-hidden dark:border-neutral-800">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.url} alt="Foto" className="h-full w-full object-cover" />
                      
                      {/* Controls overlay */}
                      <div className="absolute inset-0 bg-neutral-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(img.id)}
                            className="rounded-full bg-red-500/80 p-1 text-white hover:bg-red-600"
                          >
                            <X className="size-3.5" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleSetCoverImage(img.id)}
                          className={`w-full text-[10px] font-bold py-1 px-1.5 rounded-md flex items-center justify-center gap-1 ${
                            img.isCover
                              ? "bg-emerald-500 text-neutral-950"
                              : "bg-white/80 text-neutral-950 hover:bg-white"
                          }`}
                        >
                          {img.isCover ? (
                            <>
                              <Check className="size-3" />
                              Capa
                            </>
                          ) : (
                            "Definir como Capa"
                          )}
                        </button>
                      </div>

                      {img.isCover && (
                        <div className="absolute top-1.5 left-1.5 bg-emerald-500 text-neutral-950 text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                          Capa
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* VIRTUAL TOUR & SEO & RESPONSABLES */}
            <h3 className="font-bold text-lg text-neutral-900 dark:text-neutral-50 pt-4">Links Adicionais & SEO</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="virtualTourUrl">Tour Virtual (Link de URL externa)</Label>
                <Input id="virtualTourUrl" placeholder="Ex: https://my.matterport.com/show/?m=..." value={virtualTourUrl} onChange={(e) => setVirtualTourUrl(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="seoTitle">Meta Título (SEO)</Label>
                <Input id="seoTitle" placeholder="Ex: Cobertura Leblon - 4 suítes e Vista Cristo" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="seoDescription">Meta Descrição (SEO)</Label>
                <Input id="seoDescription" placeholder="Resumo do imóvel para mecanismos de busca" value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} />
              </div>
            </div>

            <h3 className="font-bold text-lg text-neutral-900 dark:text-neutral-50 pt-4">Contatos Internos</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="ownerName">Proprietário (Nome)</Label>
                <Input id="ownerName" placeholder="Ex: João da Silva" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="realtorName">Corretor Responsável</Label>
                <Input id="realtorName" placeholder="Ex: Marcos Corretor" value={realtorName} onChange={(e) => setRealtorName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="agencyName">Imobiliária / Filial</Label>
                <Input id="agencyName" placeholder="Ex: Filial Jardins" value={agencyName} onChange={(e) => setAgencyName(e.target.value)} />
              </div>
            </div>
          </div>
        )}

      </div>
    </form>
  )
}
