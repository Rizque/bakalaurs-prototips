import { supabase } from '@/lib/supabase';

function toUserMessage(_error: unknown, fallback: string): string {
  return fallback;
}

export const authService = {
  async signUp(email: string, password: string) {
    const { error } = await supabase.auth.signUp({ email, password });
    return {
      error: error
        ? new Error(
            toUserMessage(error, 'Reģistrācija neizdevās. Pārbaudiet ievadītos datus.')
          )
        : null,
    };
  },

  async signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return {
      error: error
        ? new Error(
            toUserMessage(error, 'Pieteikšanās neizdevās. Pārbaudiet e-pastu un paroli.')
          )
        : null,
    };
  },

  async signOut() {
    await supabase.auth.signOut();
  },

  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    return {
      error: error
        ? new Error(
            toUserMessage(
              error,
              'Atiestatīšanas pieprasījums neizdevās. Mēģiniet vēlāk.'
            )
          )
        : null,
    };
  },
};
