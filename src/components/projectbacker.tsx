"use client"

import BackerCard from './Cards/backercard'
import { Backer, getBackersById, listenEvents, parsedBackers } from '@/utils/actions';
import { useEffect, useState } from 'react';

const ProjectBacker = ({ id }: { id: number }) => {
  const [backers, setBackers] = useState<Backer[]>([])
  const results = getBackersById(id)
  const unwatch = listenEvents(results.refetch)

  useEffect(() => {
    if (results.data && !results.isLoading && results.isSuccess) {
      const parsedData = parsedBackers(results.data as { [key: string]: any })
      setBackers(parsedData)
    }
    return () => {
      unwatch?.()
    }
  }, [results.data])

  return (
    <section className="pt-4 mb-5 flex justify-center text-gray-900">
      <div className="flex justify-center flex-col w-[80%] m-auto">
        <div className="max-h-[calc(100vh_-_25rem)] overflow-y-auto
                shadow-md rounded-md w-full mb-10"
        >
          <table className="min-w-full">
            <thead className="border-b">
              <tr>
                <th
                  scope="col"
                  className="text-sm font-medium px-6 py-4 text-left"
                >
                  Backer
                </th>
                <th
                  scope="col"
                  className="text-sm font-medium px-6 py-4 text-left"
                >
                  Donations
                </th>
                <th
                  scope="col"
                  className="text-sm font-medium px-6 py-4 text-left"
                >
                  Refunded
                </th>
                <th
                  scope="col"
                  className="text-sm font-medium px-6 py-4 text-left"
                >
                  Time
                </th>
              </tr>
            </thead>
            <tbody>
              {backers.map((backer, i) => (
                <BackerCard key={i} backer={backer} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

export default ProjectBacker
