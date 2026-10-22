import { ProjectTable } from "@/components/data-tables";
import { PageHeader } from "@/components/page-header";
import { requireUser } from "@/server/guards";
import { getJudgeCatalog } from "@/server/read";

export default async function ProjectsPage() {
  const user = await requireUser("JUDGE");
  const catalog = await getJudgeCatalog(user.id);

  return (
    <div>
      <PageHeader
        kicker="Review"
        title="Projects"
        description={catalog.blindJudging ? "Identities are hidden while blind judging is on." : "Open a project to read the submission and score it."}
      />
      <ProjectTable rows={catalog.projects} />
    </div>
  );
}
