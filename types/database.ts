export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      productos: {
        Row: {
          id: string
          sku: string | null
          nombre: string
          categoria: string
          descripcion: string | null
          imagen_url: string | null
          tallas: string[]
          colores: string[]
          tecnicas: string[]
          activo: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          sku?: string | null
          nombre: string
          categoria: string
          descripcion?: string | null
          imagen_url?: string | null
          tallas?: string[]
          colores?: string[]
          tecnicas?: string[]
          activo?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          sku?: string | null
          nombre?: string
          categoria?: string
          descripcion?: string | null
          imagen_url?: string | null
          tallas?: string[]
          colores?: string[]
          tecnicas?: string[]
          activo?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      variantes: {
        Row: {
          id: string
          producto_id: string
          sku: string | null
          tecnica: string
          talla: string
          color: string
          tamano_diseno: string | null
          stock: number
          precios: Json
          activo: boolean
          created_at: string
        }
        Insert: {
          id?: string
          producto_id: string
          sku?: string | null
          tecnica: string
          talla: string
          color: string
          tamano_diseno?: string | null
          stock?: number
          precios?: Json
          activo?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          producto_id?: string
          sku?: string | null
          tecnica?: string
          talla?: string
          color?: string
          tamano_diseno?: string | null
          stock?: number
          precios?: Json
          activo?: boolean
          created_at?: string
        }
      }
      pedidos: {
        Row: {
          id: string
          cliente_nombre: string
          cliente_whatsapp: string
          variante_id: string
          cantidad: number
          precio_unitario: number
          total: number
          disenos: Json | null
          estado: 'pendiente' | 'pagado' | 'en_produccion' | 'entregado' | 'cancelado'
          comprobante_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          cliente_nombre: string
          cliente_whatsapp: string
          variante_id: string
          cantidad: number
          precio_unitario: number
          total: number
          disenos?: Json | null
          estado?: 'pendiente' | 'pagado' | 'en_produccion' | 'entregado' | 'cancelado'
          comprobante_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          cliente_nombre?: string
          cliente_whatsapp?: string
          variante_id?: string
          cantidad?: number
          precio_unitario?: number
          total?: number
          disenos?: Json | null
          estado?: 'pendiente' | 'pagado' | 'en_produccion' | 'entregado' | 'cancelado'
          comprobante_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      historial_acciones: {
        Row: {
          id: string
          usuario_id: string
          accion: string
          entidad_tipo: string
          entidad_id: string | null
          detalles: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          usuario_id: string
          accion: string
          entidad_tipo: string
          entidad_id?: string | null
          detalles?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          usuario_id?: string
          accion?: string
          entidad_tipo?: string
          entidad_id?: string | null
          detalles?: Json | null
          created_at?: string
        }
      }
    }
  }
}
