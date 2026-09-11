import { AuthForm } from "@/components/AuthForm";
import { updatePasswordAction } from "@/app/auth/actions";

export default function ResetPasswordPage() {
  return (
    <AuthForm
      title="Nueva contraseña"
      subtitle="elige una contraseña nueva para tu cuenta"
      fields={[
        {
          name: "password",
          label: "nueva contraseña",
          type: "password",
          autoComplete: "new-password",
        },
        {
          name: "passwordConfirmation",
          label: "repite la contraseña",
          type: "password",
          autoComplete: "new-password",
        },
      ]}
      action={updatePasswordAction}
      submitLabel="Guardar contraseña"
      footer={{ text: "¿Ya tienes una contraseña?", linkLabel: "Inicia sesión", href: "/login" }}
    />
  );
}