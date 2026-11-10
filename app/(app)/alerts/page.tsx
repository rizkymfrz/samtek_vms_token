import { connection } from "next/server"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertsView } from "./view"
import { buildAlerts } from "../_data/alerts-source"

const AlertsContent = async () => {
  await connection()
  return <AlertsView data={buildAlerts()} />
}

const Page = () => {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-4 p-4">
          <Skeleton className="h-8 w-full max-w-3xl" />
          <Skeleton className="h-96" />
        </div>
      }
    >
      <AlertsContent />
    </Suspense>
  )
}

export default Page
