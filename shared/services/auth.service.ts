
import { supabase } from "@/lib/supabase";
import { SupabaseClient } from "@supabase/supabase-js";

export class AuthService {
  
    async logInWithEmailAndPassword(email: string, password: string) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        
        if (error) throw error;
        return data;
    }

    async logout() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    }

    async signUpWithEmailAndPassword(email: string, password: string) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw new Error(error.message);
        return data;
      }
    

}

export const authService = new AuthService();
