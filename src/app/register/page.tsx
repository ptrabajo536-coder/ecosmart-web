import { AuthForm } from "@/components/AuthForm";
import { registerAction } from "@/app/auth/actions";

export default function RegisterPage() {
  return (
    <AuthForm
      title="Crear cuenta"
      subtitle="regístrate para controlar la iluminación del salón"
      fields={[
        { name: "name", label: "nombre", type: "text", autoComplete: "name" },
        { name: "email", label: "correo", type: "email", autoComplete: "email" },
        {
          name: "password",
          label: "contraseña",
          type: "password",
          autoComplete: "new-password",
        },
      ]}
      action={registerAction}
      submitLabel="Crear cuenta"
      footer={{
        text: "¿Ya tienes cuenta?",
        linkLabel: "Inicia sesión",
        href: "/login",
      }}
    />
  );
}
