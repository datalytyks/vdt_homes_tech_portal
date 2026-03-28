import { getErrors } from '@/actions/errors'
import { ErrorTable } from '@/components/error-table'

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: { source?: string; status?: string }
}

export default async function ErrorsPage({ searchParams }: Props) {
  const source = searchParams.source ?? 'all'
  const status = searchParams.status ?? 'open'
  const errors = await getErrors(source, status)

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-xl font-semibold text-white">Error Tracking</h1>
        <p className="text-gray-400 text-sm mt-1">
          {errors.length} result{errors.length !== 1 ? 's' : ''}
        </p>
      </div>
      <ErrorTable errors={errors as any[]} currentSource={source} currentStatus={status} />
    </div>
  )
}
