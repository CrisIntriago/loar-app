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
          nombre: string
          categoria: 'camiseta' | 'crop_top' | 'ranglan' | 'oversize' | 'polo' | 'hoodie' | 'buzo' | 'boxer' | 'pijama' | 'almohada' | 'taza'
          tecnicas: ('dtf' | 'bordado' | 'sublimado' | 'llano')[]
          tallas: string[]
          colores: string[]
          stock: number
          precio_base: number
          precio_mayorista: number | null
          cantidad_mayorista: number
          activo: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nombre: string
          categoria: 'camiseta' | 'crop_top' | 'ranglan' | 'oversize' | 'polo' | 'hoodie' | 'buzo' | 'boxer' | 'pijama' | 'almohada' | 'taza'
          tecnicas: ('dtf' | 'bordado' | 'sublimado' | 'llano')[]
          tallas: string[]
          colores: string[]
          stock?: number
          precio_base: number
          precio_mayorista?: number | null
          cantidad_mayorista?: number
          activo?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nombre?: string
          categoria?: 'camiseta' | 'crop_top' | 'ranglan' | 'oversize' | 'polo' | 'hoodie' | 'buzo' | 'boxer' | 'pijama' | 'almohada' | 'taza'
          tecnicas?: ('dtf' | 'bordado' | 'sublimado' | 'llano')[]
          tallas?: string[]
          colores?: string[]
          stock?: number
          precio_base?: number
          precio_mayorista?: number | null
          cantidad_mayorista?: number
          activo?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      pedidos: {
        Row: {
          id: string
          cliente_nombre: string
          cliente_whatsapp: string
          producto_id: string
          talla: string
          color: string
          tecnica: 'dtf' | 'bordado' | 'sublimado' | 'llano'
          cantidad: number
          total: number
          estado: 'pendiente' | 'pagado' | 'en_produccion' | 'entregado' | 'cancelado'
          comprobante_url: string | null
          diseno_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          cliente_nombre: string
          cliente_whatsapp: string
          producto_id: string
          talla: string
          color: string
          tecnica: 'dtf' | 'bordado' | 'sublimado' | 'llano'
          cantidad?: number
          total: number
          estado?: 'pendiente' | 'pagado' | 'en_produccion' | 'entregado' | 'cancelado'
          comprobante_url?: string | null
          diseno_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          cliente_nombre?: string
          cliente_whatsapp?: string
          producto_id?: string
          talla?: string
          color?: string
          tecnica?: 'dtf' | 'bordado' | 'sublimado' | 'llano'
          cantidad?: number
          total?: number
          estado?: 'pendiente' | 'pagado' | 'en_produccion' | 'entregado' | 'cancelado'
          comprobante_url?: string | null
          diseno_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      historial_acciones: {
        Row: {
          id: string
          usuario_id: string
          accion: 'creo_pedido' | 'aprobo_pago' | 'actualizo_stock' | 'creo_producto'
          entidad_tipo: 'pedido' | 'producto'
          entidad_id: string | null
          detalles: Json
          created_at: string
        }
        Insert: {
          id?: string
          usuario_id: string
          accion: 'creo_pedido' | 'aprobo_pago' | 'actualizo_stock' | 'creo_producto'
          entidad_tipo: 'pedido' | 'producto'
          entidad_id?: string | null
          detalles: Json
          created_at?: string
        }
        Update: {
          id?: string
          usuario_id?: string
          accion?: 'creo_pedido' | 'aprobo_pago' | 'actualizo_stock' | 'creo_producto'
          entidad_tipo?: 'pedido' | 'producto'
          entidad_id?: string | null
          detalles?: Json
          created_at?: string
        }
      }
      producto_precios: {
        Row: {
          id: string
          producto_id: string
          cantidad_minima: number
          cantidad_maxima: number | null
          precio_unitario: number
        }
        Insert: {
          id?: string
          producto_id: string
          cantidad_minima: number
          cantidad_maxima?: number | null
          precio_unitario: number
        }
        Update: {
          id?: string
          producto_id?: string
          cantidad_minima?: number
          cantidad_maxima?: number | null
          precio_unitario?: number
        }
      }
      configuracion_webhook: {
        Row: {
          id: string
          tipo: 'nuevo_pedido'
          webhook_url: string
          activo: boolean
        }
        Insert: {
          id?: string
          tipo: 'nuevo_pedido'
          webhook_url: string
          activo?: boolean
        }
        Update: {
          id?: string
          tipo?: 'nuevo_pedido'
          webhook_url?: string
          activo?: boolean
        }
      }
    }
  }
}
