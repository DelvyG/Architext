import { setRequestLocale } from "next-intl/server";
import { LoginForm } from "./login-form";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function LoginPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <LoginForm />;
}
