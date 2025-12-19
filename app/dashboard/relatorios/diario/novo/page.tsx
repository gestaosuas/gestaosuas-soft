
import { DailyFormClient } from "./daily-form-client"
import { notFound } from "next/navigation"

export default async function DailyReportPage({
    searchParams,
}: {
    searchParams: Promise<{ directorate_id?: string }>
}) {
    const { directorate_id } = await searchParams

    if (!directorate_id) {
        notFound()
    }

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <DailyFormClient directorateId={directorate_id} />
        </div>
    )
}
