import { setRequestLocale } from "next-intl/server";
import { NewProjectForm } from "./new-project-form";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function NewProjectPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <NewProjectForm />
    </div>
  );
}
