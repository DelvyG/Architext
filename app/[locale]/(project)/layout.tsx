import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getSession } from "@/lib/auth/session";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function ProjectLayout({ children, params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await getSession();
  if (!session) {
    redirect(`/${locale}/login`);
  }

  return <>{children}</>;
}
