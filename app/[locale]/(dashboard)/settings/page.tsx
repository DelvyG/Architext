import { setRequestLocale, getTranslations } from "next-intl/server";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function SettingsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("dashboard.settings");

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">{t("title")}</h1>
      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">{t("profile")}</TabsTrigger>
          <TabsTrigger value="api-keys">{t("apiKeys")}</TabsTrigger>
          <TabsTrigger value="account">{t("account")}</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="mt-6">
          <p className="text-muted-foreground">{t("comingSoon")}</p>
        </TabsContent>
        <TabsContent value="api-keys" className="mt-6">
          <p className="text-muted-foreground">{t("comingSoon")}</p>
        </TabsContent>
        <TabsContent value="account" className="mt-6">
          <p className="text-muted-foreground">{t("comingSoon")}</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
