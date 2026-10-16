import { getAdminSupabase } from '../server';

export interface Availability {
  id?: string;
  dayOfWeek: number | null;
  specificDate: Date | null;
  startTime: string;
  endTime: string;
  slotMinutes: number;
  active: boolean;
}

export interface BlockedSlot {
  id?: string;
  startAt: Date;
  endAt: Date;
  reason: string | null;
  createdAt: Date;
}

interface WeeklyDayConfig {
  dayOfWeek: number | null;
  startTime: string;
  endTime: string;
  slotMinutes: number;
  active: boolean;
}

const DEFAULT_DAY_CONFIG: WeeklyDayConfig = {
  dayOfWeek: null,
  startTime: '09:00',
  endTime: '18:00',
  slotMinutes: 60,
  active: true,
};

function toDayConfigs(days: unknown): WeeklyDayConfig[] {
  if (!Array.isArray(days)) return [];
  return days
    .filter((d): d is Record<string, unknown> => typeof d === 'object' && d !== null)
    .map((d) => ({
      dayOfWeek: typeof d.dayOfWeek === 'number' ? d.dayOfWeek : null,
      startTime: typeof d.startTime === 'string' ? d.startTime : DEFAULT_DAY_CONFIG.startTime,
      endTime: typeof d.endTime === 'string' ? d.endTime : DEFAULT_DAY_CONFIG.endTime,
      slotMinutes: typeof d.slotMinutes === 'number' ? d.slotMinutes : DEFAULT_DAY_CONFIG.slotMinutes,
      active: d.active !== false,
    }));
}

function toAvailability(config: WeeklyDayConfig): Availability {
  return { ...config, specificDate: null };
}

function defaultWeek(): Availability[] {
  // Agenda por defecto lunes a sábado 9:00 - 18:00
  return [1, 2, 3, 4, 5, 6].map((day) => toAvailability({ ...DEFAULT_DAY_CONFIG, dayOfWeek: day }));
}

export const availabilityRepository = {
  async listWeekly(): Promise<Availability[]> {
    const { data, error } = await getAdminSupabase()
      .from('availability_settings')
      .select('*')
      .eq('id', 'default')
      .maybeSingle();

    if (error || !data) {
      return defaultWeek();
    }

    // Columna `weekly` (migración add_availability_weekly_config.sql): conserva
    // horas por día. Sin ella, compatibilidad con `work_days` heredado.
    const row = data as Record<string, unknown>;
    if (Array.isArray(row.weekly)) {
      const configs = toDayConfigs(row.weekly);
      if (configs.length > 0) return configs.map(toAvailability);
    }

    const workDays: number[] = Array.isArray(row.work_days) ? (row.work_days as number[]) : [1, 2, 3, 4, 5, 6];
    return workDays.map((day) => toAvailability({ ...DEFAULT_DAY_CONFIG, dayOfWeek: day }));
  },

  async saveWeekly(availabilities: Omit<Availability, 'id'>[]): Promise<void> {
    const active = availabilities.filter((a) => a.active && a.dayOfWeek !== null);
    const weekly = active.map((a) => ({
      dayOfWeek: a.dayOfWeek,
      startTime: a.startTime,
      endTime: a.endTime,
      slotMinutes: a.slotMinutes,
      active: a.active,
    }));

    // Intento con columna `weekly`; si aún no existe (migración pendiente),
    // retrocede al formato heredado `work_days` sin romper el guardado.
    const withWeekly = await getAdminSupabase()
      .from('availability_settings')
      .upsert({
        id: 'default',
        work_days: active.map((a) => a.dayOfWeek),
        weekly,
        updated_at: new Date().toISOString(),
      });

    if (!withWeekly.error) return;

    const legacy = await getAdminSupabase()
      .from('availability_settings')
      .upsert({
        id: 'default',
        work_days: active.map((a) => a.dayOfWeek),
        updated_at: new Date().toISOString(),
      });

    if (legacy.error) throw new Error(`Failed to save availability in Supabase: ${legacy.error.message}`);
  },

  async listBlocked(startAt: Date, endAt: Date): Promise<BlockedSlot[]> {
    // Tabla `blocked_slots` (migración add_blocked_slots.sql). Si aún no
    // existe, se devuelve vacío como antes en lugar de romper disponibilidad.
    const { data, error } = await getAdminSupabase()
      .from('blocked_slots')
      .select('*')
      .lt('start_at', endAt.toISOString())
      .gt('end_at', startAt.toISOString());

    if (error || !data) return [];
    return (data as Record<string, unknown>[]).map((row) => ({
      id: typeof row.id === 'string' ? row.id : undefined,
      startAt: new Date(String(row.start_at)),
      endAt: new Date(String(row.end_at)),
      reason: typeof row.reason === 'string' ? row.reason : null,
      createdAt: new Date(String(row.created_at ?? row.start_at)),
    }));
  },

  async blockSlot(slot: Omit<BlockedSlot, 'id' | 'createdAt'>): Promise<BlockedSlot> {
    const { data, error } = await getAdminSupabase()
      .from('blocked_slots')
      .insert({
        start_at: slot.startAt.toISOString(),
        end_at: slot.endAt.toISOString(),
        reason: slot.reason,
      })
      .select('*')
      .single();

    if (error || !data) {
      throw new Error(`Failed to block slot in Supabase: ${error?.message || 'tabla blocked_slots ausente (migración pendiente)'}`);
    }

    const row = data as Record<string, unknown>;
    return {
      id: typeof row.id === 'string' ? row.id : undefined,
      startAt: new Date(String(row.start_at)),
      endAt: new Date(String(row.end_at)),
      reason: typeof row.reason === 'string' ? row.reason : null,
      createdAt: new Date(String(row.created_at)),
    };
  },

  async unblockSlot(id: string): Promise<void> {
    const { error } = await getAdminSupabase().from('blocked_slots').delete().eq('id', id);

    if (error) throw new Error(`Failed to unblock slot in Supabase: ${error.message}`);
  },
};
