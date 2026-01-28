import { createSupabaseClient } from "@/lib/supabase";



export class AuthService {
    supabase = createSupabaseClient();
    async logInWithEmailAndPassword(email: string, password: string) {
       
        const { data, error } = await this.supabase.auth.signInWithPassword({
            email,
            password,
        });
        
        if (error) throw error;
        return data;
    }

    async logout() {
        const { error } = await this.supabase.auth.signOut();
        if (error) throw error;
    }

    async signUpWithEmailAndPassword(email: string, password: string) {
        const { data, error } = await this.supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw new Error(error.message);
        return data;
      }
    

}

export const authService = new AuthService();
