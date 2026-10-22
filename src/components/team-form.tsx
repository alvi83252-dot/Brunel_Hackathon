"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Field, readJson } from "@/components/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Member = { fullName: string; studentId: string; email: string };

export function TeamForm({
  teamId,
  locked,
  captain,
  initialName,
  initialMembers,
}: {
  teamId?: string;
  locked: boolean;
  captain: { fullName: string; studentId: string; email: string };
  initialName: string;
  initialMembers: Member[];
}) {
  const router = useRouter();
  const [teamName, setTeamName] = useState(initialName);
  const [members, setMembers] = useState<Member[]>(initialMembers.length >= 2 ? initialMembers : [captain, { fullName: "", studentId: "", email: "" }]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);

  function updateMember(index: number, key: keyof Member, value: string) {
    setMembers((current) => current.map((member, memberIndex) => (memberIndex === index ? { ...member, [key]: value } : member)));
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (locked) return;
    setPending(true);
    setErrors({});
    const payload = {
      teamName,
      members: members.map((member, index) => (index === 0 ? { ...captain, fullName: member.fullName } : member)),
    };
    const response = await fetch(teamId ? `/api/teams/${teamId}` : "/api/teams", {
      method: teamId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await readJson(response);
    if (!response.ok) {
      setErrors(result.fieldErrors);
      toast.error(result.error);
      setPending(false);
      return;
    }
    toast.success(teamId ? "Team updated. A confirmation email has been recorded." : "Team registered. A confirmation email has been recorded.");
    router.push("/participant");
    router.refresh();
  }

  return (
    <form className="grid gap-5" onSubmit={onSubmit} noValidate>
      <Field label="Team name" htmlFor="teamName" error={errors.teamName} hint="This is the name judges see when blind judging is off." count={`${teamName.length}/60`}>
        <Input id="teamName" value={teamName} maxLength={60} disabled={locked || pending} onChange={(event) => setTeamName(event.target.value)} aria-invalid={Boolean(errors.teamName)} />
      </Field>
      <div className="rounded-xl border border-border bg-secondary/60 p-4 text-sm">
        <p className="font-semibold">Team captain</p>
        <p className="mt-1 text-muted-foreground">{captain.fullName} · {captain.studentId} · {captain.email}</p>
      </div>
      <div className="grid gap-4">
        {members.map((member, index) => (
          <fieldset key={index} className="grid gap-3 rounded-2xl border border-border p-4">
            <legend className="px-1 text-sm font-bold">{index === 0 ? "Captain" : `Teammate ${index}`}</legend>
            <Field label="Full name" htmlFor={`name-${index}`} error={errors[`members.${index}.fullName`]}>
              <Input id={`name-${index}`} value={member.fullName} disabled={locked || pending} onChange={(event) => updateMember(index, "fullName", event.target.value)} aria-invalid={Boolean(errors[`members.${index}.fullName`])} />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Student ID" htmlFor={`id-${index}`} error={errors[`members.${index}.studentId`]}>
                <Input id={`id-${index}`} value={index === 0 ? captain.studentId : member.studentId} disabled={locked || pending || index === 0} onChange={(event) => updateMember(index, "studentId", event.target.value)} aria-invalid={Boolean(errors[`members.${index}.studentId`])} />
              </Field>
              <Field label="Brunel email" htmlFor={`email-${index}`} error={errors[`members.${index}.email`]} hint="@student.brunel.ac.uk or @brunel.ac.uk">
                <Input id={`email-${index}`} type="email" value={index === 0 ? captain.email : member.email} disabled={locked || pending || index === 0} onChange={(event) => updateMember(index, "email", event.target.value)} aria-invalid={Boolean(errors[`members.${index}.email`])} />
              </Field>
            </div>
            {index > 0 && members.length > 2 && !locked ? (
              <Button type="button" variant="secondary" onClick={() => setMembers((current) => current.filter((_, memberIndex) => memberIndex !== index))}>
                Remove teammate
              </Button>
            ) : null}
          </fieldset>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {members.length < 6 && !locked ? (
          <Button type="button" variant="secondary" onClick={() => setMembers((current) => [...current, { fullName: "", studentId: "", email: "" }])}>
            Add teammate
          </Button>
        ) : null}
        <Button type="submit" disabled={locked || pending}>
          {pending ? "Saving…" : teamId ? "Update team" : "Register team"}
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">A team needs 2 to 6 people, including the captain. Student IDs and emails must be unique.</p>
    </form>
  );
}
