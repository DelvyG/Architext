import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth/session";
import {
  ArrowRight,
  Blocks,
  Sparkles,
  FileOutput,
  MessageSquareText,
  MousePointerClick,
  Download,
  Code2,
  Globe,
  Server,
} from "lucide-react";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await getSession();
  if (session) {
    redirect(`/${locale}/projects`);
  }

  return <Landing locale={locale} />;
}

function Landing({ locale }: { locale: string }) {
  const t = useTranslations("app.landing");

  return (
    <div className="flex flex-col bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-sm">
        <div className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto w-full">
          <span className="text-sm font-bold tracking-tight">Architext</span>
          <div className="flex items-center gap-1">
            <LanguageSwitch locale={locale} />
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-muted-foreground text-xs">
                {t("login")}
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="text-xs h-8">
                {t("cta").split("—")[0]?.trim() ?? t("cta")}
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Subtle gradient bg */}
        <div className="absolute inset-0 bg-gradient-to-b from-stone-50 to-background pointer-events-none" />
        <div className="relative flex flex-col items-center px-6 pt-28 pb-36 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-white px-3.5 py-1.5 text-xs text-muted-foreground shadow-sm mb-8">
            <Code2 className="h-3.5 w-3.5" />
            {t("openSource")} &middot; MIT
          </div>
          <h1 className="text-4xl sm:text-[3.25rem] font-bold tracking-tight leading-[1.08]">
            {t("hero")}
          </h1>
          <p className="mt-5 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-md">
            {t("heroSub")}
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center gap-3">
            <Link href="/signup">
              <Button size="lg" className="gap-2 shadow-sm px-6">
                {t("cta")}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why section */}
      <section className="border-t border-border/40">
        <div className="max-w-4xl mx-auto px-6 py-24">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-14 text-center">
            {t("whyTitle")}
          </p>
          <div className="grid sm:grid-cols-3 gap-10">
            <FeatureCard
              icon={<Sparkles className="h-5 w-5" />}
              color="amber"
              title={t("why1Title")}
              desc={t("why1Desc")}
            />
            <FeatureCard
              icon={<Blocks className="h-5 w-5" />}
              color="blue"
              title={t("why2Title")}
              desc={t("why2Desc")}
            />
            <FeatureCard
              icon={<FileOutput className="h-5 w-5" />}
              color="emerald"
              title={t("why3Title")}
              desc={t("why3Desc")}
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border/40 bg-stone-50/50">
        <div className="max-w-3xl mx-auto px-6 py-24">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-16 text-center">
            {t("howTitle")}
          </p>
          <div className="space-y-0">
            <StepCard
              number="1"
              icon={<MessageSquareText className="h-4.5 w-4.5" />}
              title={t("how1Title")}
              desc={t("how1Desc")}
              isLast={false}
            />
            <StepCard
              number="2"
              icon={<MousePointerClick className="h-4.5 w-4.5" />}
              title={t("how2Title")}
              desc={t("how2Desc")}
              isLast={false}
            />
            <StepCard
              number="3"
              icon={<Download className="h-4.5 w-4.5" />}
              title={t("how3Title")}
              desc={t("how3Desc")}
              isLast={true}
            />
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="border-t border-border/40">
        <div className="max-w-4xl mx-auto px-6 py-24">
          <div className="grid sm:grid-cols-3 gap-8">
            <PrincipleCard
              icon={<Code2 className="h-4.5 w-4.5" />}
              title={t("openSource")}
              desc={t("openSourceDesc")}
            />
            <PrincipleCard
              icon={<Globe className="h-4.5 w-4.5" />}
              title={t("free")}
              desc={t("freeDesc")}
            />
            <PrincipleCard
              icon={<Server className="h-4.5 w-4.5" />}
              title={t("private")}
              desc={t("privateDesc")}
            />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-border/40 bg-stone-50/50">
        <div className="flex flex-col items-center px-6 py-24 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{t("finalCta")}</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            {t("free")} &middot; {t("openSource")}
          </p>
          <div className="mt-8">
            <Link href="/signup">
              <Button size="lg" className="gap-2 shadow-sm px-6">
                {t("finalCtaButton")}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-xs text-muted-foreground">
          <span>{t("footer")}</span>
          <a
            href="https://github.com/DelvyG/Architext"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            {t("footerGithub")}
          </a>
        </div>
      </footer>
    </div>
  );
}

const ACCENT_COLORS = {
  amber: {
    bg: "bg-amber-50",
    border: "border-amber-200/60",
    icon: "text-amber-600",
  },
  blue: {
    bg: "bg-blue-50",
    border: "border-blue-200/60",
    icon: "text-blue-600",
  },
  emerald: {
    bg: "bg-emerald-50",
    border: "border-emerald-200/60",
    icon: "text-emerald-600",
  },
} as const;

function FeatureCard({
  icon,
  color,
  title,
  desc,
}: {
  icon: React.ReactNode;
  color: keyof typeof ACCENT_COLORS;
  title: string;
  desc: string;
}) {
  const c = ACCENT_COLORS[color];
  return (
    <div className="rounded-xl border border-border/50 bg-white p-6 shadow-sm">
      <div
        className={`inline-flex items-center justify-center h-10 w-10 rounded-lg ${c.bg} border ${c.border} mb-4`}
      >
        <span className={c.icon}>{icon}</span>
      </div>
      <h3 className="font-semibold mb-2 text-[0.925rem]">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}

function StepCard({
  number,
  icon,
  title,
  desc,
  isLast,
}: {
  number: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  isLast: boolean;
}) {
  return (
    <div className="flex gap-5">
      {/* Timeline */}
      <div className="flex flex-col items-center">
        <div className="flex items-center justify-center h-9 w-9 rounded-full bg-foreground text-background text-xs font-bold shrink-0">
          {number}
        </div>
        {!isLast && <div className="w-px flex-1 bg-border/60 my-2" />}
      </div>
      {/* Content */}
      <div className={`${isLast ? "pb-0" : "pb-12"}`}>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-muted-foreground">{icon}</span>
          <h3 className="font-semibold text-[0.925rem]">{title}</h3>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function PrincipleCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="text-center p-6 rounded-xl border border-border/40 bg-stone-50/50">
      <div className="inline-flex items-center justify-center h-9 w-9 rounded-lg bg-white border border-border/60 shadow-sm mb-3 text-muted-foreground">
        {icon}
      </div>
      <p className="font-semibold text-sm mb-1">{title}</p>
      <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}

function LanguageSwitch({ locale }: { locale: string }) {
  const otherLocale = locale === "en" ? "es" : "en";
  const label = locale === "en" ? "ES" : "EN";

  return (
    <a
      href={`/${otherLocale}`}
      className="inline-flex items-center justify-center h-8 px-2.5 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
    >
      {label}
    </a>
  );
}
