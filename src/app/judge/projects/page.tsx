import { ProjectTable } from "@/components/data-tables";
import { requireUser } from "@/server/guards";
import { getJudgeCatalog } from "@/server/read";

export default async function ProjectsPage() {
  const user = await requireUser("JUDGE");
  const catalog = await getJudgeCatalog(user.id);

  return (
    <div className="grid gap-4">
      <div>
        <h1 className="text-3xl font-bold">Projects</h1>
        <p className="mt-1 text-muted-foreground">
          {catalog.blindJudging ? "Identities are hidden while blind judging is on." : "Open a project to read the submission and score it."}
        </p>
      </div>
      <ProjectTable rows={catalog.projects} />
    </div>
  );
}
