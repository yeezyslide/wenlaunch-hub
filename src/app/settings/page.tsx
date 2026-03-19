import { prisma } from "@/lib/prisma";
import { MemberList } from "@/components/settings/member-list";
import { MemberForm } from "@/components/settings/member-form";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const members = await prisma.teamMember.findMany({
    include: { _count: { select: { tasks: true } } },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-semibold tracking-[-0.02em]">Settings</h1>
          <p className="text-[14px] text-muted-foreground mt-0.5">Manage your team members</p>
        </div>
        <MemberForm />
      </div>
      <MemberList members={members} />
    </div>
  );
}
