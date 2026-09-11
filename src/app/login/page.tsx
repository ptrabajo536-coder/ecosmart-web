import { AuthForm } from "@/components/AuthForm";
import { loginAction } from "@/app/auth/actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string }>;
}) {
  const params = await searchParams;

  return (
    <AuthForm
      title="Iniciar sesión"
      subtitle="accede al panel de control del salón"
      fields={[
        { name: "email", label: "correo", type: "email", autoComplete: "email" },
        {
          name: "password",
          label: "contraseña",
          type: "password",
          autoComplete: "current-password",
        },
      ]}
      action={loginAction}
      submitLabel="Ingresar"
      footer={{
        text: "¿No tienes cuenta?",
        linkLabel: "Regístrate",
        href: "/register",
      }}
      notice={
        params.registered
          ? "Cuenta creada. Revisa tu correo si se te pide confirmarla, luego inicia sesión."
          : null
      }
    />
  );
}
