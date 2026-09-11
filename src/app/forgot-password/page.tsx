import { AuthForm } from "@/components/AuthForm";
import { forgotPasswordAction } from "@/app/auth/actions";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string }>;
}) {
  const params = await searchParams;

  return (
    <AuthForm
      title="Recuperar contraseña"
      subtitle="te enviaremos un enlace para crear una nueva"
      fields={[{ name: "email", label: "correo", type: "email", autoComplete: "email" }]}
      action={forgotPasswordAction}
      submitLabel="Enviar enlace"
      footer={{ text: "¿Recordaste tu contraseña?", linkLabel: "Inicia sesión", href: "/login" }}
      notice={
        params.sent
          ? "Si existe una cuenta con ese correo, recibirás un enlace para recuperar la contraseña."
          : null
      }
    />
  );
}