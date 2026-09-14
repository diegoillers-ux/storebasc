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

export const availabilityRepository = {
  async listWeekly(): Promise<Availability[]> {
    const { data, error } = await getAdminSupabase()
      .from('availability_settings')
      .select('*')
      .eq('id', 'default')
      .maybeSingle();

    if (error || !data) {
      // Retornar agenda por defecto lunes a sábado 9:00 - 18:00
      return [1, 2, 3, 4, 5, 6].map((day) => ({
        dayOfWeek: day,
        specificDate: null,
        startTime: '09:00',
        endTime: '18:00',
        slotMinutes: 60,
        active: true,
      }));
    }

    const workDays: number[] = Array.isArray(data.work_days) ? data.work_days : [1, 2, 3, 4, 5, 6];
    return workDays.map((day) => ({
      dayOfWeek: day,
      specificDate: null,
      startTime: '09:00',
      endTime: '18:00',
      slotMinutes: 60,
      active: true,
    }));
  },

  async saveWeekly(availabilities: Omit<Availability, 'id'>[]): Promise<void> {
    const workDays = availabilities.filter((a) => a.active && a.dayOfWeek !== null).map((a) => a.dayOfWeek);

    const { error } = await getAdminSupabase()
      .from('availability_settings')
      .upsert({
        id: 'default',
        work_days: workDays,
        updated_at: new Date().toISOString(),
      });

    if (error) throw new Error(`Failed to save availability in Supabase: ${error.message}`);
  },

  async listBlocked(startAt: Date, endAt: Date): Promise<BlockedSlot[]> {
    return [];
  },

  async blockSlot(slot: Omit<BlockedSlot, 'id' | 'createdAt'>): Promise<BlockedSlot> {
    return {
      id: `block_${Date.now()}`,
      startAt: slot.startAt,
      endAt: slot.endAt,
      reason: slot.reason,
      createdAt: new Date(),
    };
  },

  async unblockSlot(id: string): Promise<void> {},
};
