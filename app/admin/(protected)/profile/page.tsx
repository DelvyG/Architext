import { requireAdmin } from "@/lib/auth/admin";
import { AdminProfileForm } from "./profile-form";

export default async function AdminProfilePage() {
  const { session } = await requireAdmin();

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold">Admin Profile</h2>
      <div className="max-w-lg">
        <AdminProfileForm name={session.user.name ?? ""} email={session.user.email} />
      </div>
    </div>
  );
}
