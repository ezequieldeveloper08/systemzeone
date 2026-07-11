"use client"

import React, { useState } from "react"
import { Table, CreateTableInput } from "../types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Plus, Trash2, Edit2, Users, Tag, Save } from "lucide-react"

interface ManageTablesModalProps {
  tables: Table[]
  onClose: () => void
  onCreate: (input: CreateTableInput) => Promise<any>
  onUpdate: (id: string, input: Partial<CreateTableInput>) => Promise<any>
  onDelete: (id: string) => Promise<void>
}

export function ManageTablesModal({
  tables,
  onClose,
  onCreate,
  onUpdate,
  onDelete,
}: ManageTablesModalProps) {
  const [form, setForm] = useState({ number: "", capacity: 4, label: "" })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ number: "", capacity: 4, label: "" })
  const [loading, setLoading] = useState(false)

  const handleCreate = async () => {
    if (!form.number.trim()) return
    setLoading(true)
    try {
      await onCreate({ number: form.number.trim(), capacity: form.capacity, label: form.label || undefined })
      setForm({ number: "", capacity: 4, label: "" })
    } finally {
      setLoading(false)
    }
  }

  const startEdit = (table: Table) => {
    setEditingId(table.id)
    setEditForm({ number: table.number, capacity: table.capacity, label: table.label || "" })
  }

  const handleSaveEdit = async () => {
    if (!editingId) return
    setLoading(true)
    try {
      await onUpdate(editingId, {
        number: editForm.number,
        capacity: editForm.capacity,
        label: editForm.label || undefined,
      })
      setEditingId(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl max-h-[90vh] bg-white dark:bg-neutral-950 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <div>
            <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Gerenciar Mesas</h2>
            <p className="text-xs text-neutral-400 mt-0.5">Adicione, edite ou remova mesas do restaurante</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors">
            <X className="size-5 text-neutral-500" />
          </button>
        </div>

        {/* Add new table form */}
        <div className="px-6 py-4 bg-neutral-50 dark:bg-neutral-900/50 border-b border-neutral-200 dark:border-neutral-800">
          <p className="text-xs font-bold uppercase text-neutral-500 dark:text-neutral-400 mb-3">Nova Mesa</p>
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <Label htmlFor="tableNumber" className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1 block">Número / Nome</Label>
              <Input
                id="tableNumber"
                placeholder="Ex: 1, VIP A, Varanda..."
                value={form.number}
                onChange={(e) => setForm({ ...form, number: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                className="h-9 text-sm"
              />
            </div>
            <div className="w-28">
              <Label htmlFor="tableCapacity" className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1 block">Capacidade</Label>
              <Input
                id="tableCapacity"
                type="number"
                min={1}
                max={50}
                value={form.capacity}
                onChange={(e) => setForm({ ...form, capacity: parseInt(e.target.value) || 1 })}
                className="h-9 text-sm"
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="tableLabel" className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1 block">Etiqueta (opcional)</Label>
              <Input
                id="tableLabel"
                placeholder="Ex: Jardim, Terraço..."
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                className="h-9 text-sm"
              />
            </div>
            <Button
              onClick={handleCreate}
              disabled={!form.number.trim() || loading}
              className="h-9 bg-neutral-950 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 shrink-0"
            >
              <Plus className="size-4" />
              Adicionar
            </Button>
          </div>
        </div>

        {/* Table list */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
          {tables.length === 0 ? (
            <div className="text-center py-16 text-neutral-400">
              <p className="text-sm font-medium">Nenhuma mesa cadastrada</p>
              <p className="text-xs mt-1">Adicione a primeira mesa acima</p>
            </div>
          ) : (
            tables.map((table) => (
              <div
                key={table.id}
                className="flex items-center gap-3 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 group"
              >
                {editingId === table.id ? (
                  <div className="flex flex-1 items-center gap-2">
                    <Input
                      value={editForm.number}
                      onChange={(e) => setEditForm({ ...editForm, number: e.target.value })}
                      className="h-8 text-sm w-24"
                    />
                    <Input
                      type="number"
                      min={1}
                      value={editForm.capacity}
                      onChange={(e) => setEditForm({ ...editForm, capacity: parseInt(e.target.value) || 1 })}
                      className="h-8 text-sm w-20"
                    />
                    <Input
                      value={editForm.label}
                      onChange={(e) => setEditForm({ ...editForm, label: e.target.value })}
                      placeholder="Etiqueta..."
                      className="h-8 text-sm flex-1"
                    />
                    <Button onClick={handleSaveEdit} disabled={loading} className="h-8 text-xs px-3 bg-emerald-600 hover:bg-emerald-700 text-white">
                      <Save className="size-3.5 mr-1" /> Salvar
                    </Button>
                    <Button variant="ghost" onClick={() => setEditingId(null)} className="h-8 text-xs px-3">
                      Cancelar
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-center size-9 rounded-lg bg-neutral-100 dark:bg-neutral-800 font-bold text-sm text-neutral-800 dark:text-neutral-200 shrink-0">
                      {table.number}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                        Mesa {table.number}
                        {table.label && (
                          <span className="ml-2 text-xs font-normal text-neutral-500">• {table.label}</span>
                        )}
                      </p>
                      <p className="text-xs text-neutral-400 flex items-center gap-1 mt-0.5">
                        <Users className="size-3" /> {table.capacity} pessoa{table.capacity > 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => startEdit(table)}
                        className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
                      >
                        <Edit2 className="size-3.5" />
                      </button>
                      <button
                        onClick={() => onDelete(table.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-neutral-500 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
