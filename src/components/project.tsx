"use client"

import { useEffect, useState } from 'react'
import ProjectCard from './Cards/projectcard'
import { getCampaigns, parsedCampaigns, campaignProps, listenEvents } from '@/utils/actions'

const Project = () => {
    const [campaigns, setCampaigns] = useState<campaignProps[]>([])
    const results = getCampaigns()
    const unwatch = listenEvents(results.refetch)

    useEffect(() => {
        if (results.data && !results.isLoading && results.isSuccess) {
            const parsedData = parsedCampaigns(results.data as { [key: string]: any })
            setCampaigns(parsedData)
        }
        return () => {
            unwatch?.()
        }
    }, [results.data])

    return (
        <div id='campaigns' className="flex flex-col px-6 mb-7 bg-white pb-6">
            <div className="flex justify-center items-start flex-wrap">
                {campaigns.map((campaign, i) => (
                    <ProjectCard key={i} {...campaign} />
                ))}
            </div>
        </div>
    )
}

export default Project
