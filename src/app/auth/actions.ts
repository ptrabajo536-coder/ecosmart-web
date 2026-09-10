"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface AuthActionState {
  error: string | null;
}

function getStringField(formData: FormData, field: string): string {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Registra un nuevo estudiante con correo y contraseña.
 * Si el proyecto de Supabase tiene "Confirm email" activado, el usuario
 * deberá revisar su correo antes de poder iniciar sesión.
 */
export async function registerAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = getStringField(formData, "email");
  const password = getStringField(formData, "password");
  const name = getStringField(formData, "name");

  if (!email || !password) {
    return { error: "Correo y contraseña son obligatorios." };
  }
  if (password.length < 6) {
    return { error: "La contraseña debe tener al menos 6 caracteres." };
  }

  const supabase = await createClient();
  const { error, data } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: name || null } },
  });

  if (error) {
    return { error: error.message };
  }

  // Si "Confirm email" está desactivado en Supabase, ya queda con sesión
  // iniciada y podemos mandarlo directo al dashboard.
  if (data.session) {
    redirect("/");
  }

  redirect("/login?registered=1");
}

export async function loginAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = getStringField(formData, "email");
  const password = getStringField(formData, "password");

  if (!email || !password) {
    return { error: "Correo y contraseña son obligatorios." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "Correo o contraseña incorrectos." };
  }

  redirect("/");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
