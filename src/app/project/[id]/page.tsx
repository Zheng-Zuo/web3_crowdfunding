import { ProjectBacker, ProjectDetail } from "@/components";

export default function Home({ params }: { params: { id: string } }) {
  const campaignId = parseInt(params.id)

  return (
    <main>
      <ProjectDetail id={campaignId} />
      <ProjectBacker id={campaignId} />
    </main>
  )
}