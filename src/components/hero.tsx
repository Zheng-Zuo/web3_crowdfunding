"use client"

import { useEffect, useState } from 'react'
import AddModal from './addmodal'
import { getStats, listenEvents, parseStats } from '@/utils/actions'
import Link from 'next/link'

const Hero = () => {
    const [stats, setStats] = useState({
        totalCampaigns: "",
        totalBackings: "",
        totalDonations: "",
    })
    const results = getStats()
    const unwatch = listenEvents(results.refetch)

    useEffect(() => {
        if (results.data && !results.isLoading && results.isSuccess) {
            const parsedData = parseStats(results.data as { [key: string]: bigint })
            setStats(parsedData)
        }
        return () => {
            unwatch?.()
        }
    }, [results.data])

    return (
        <div className='text-center bg-white text-gray-800 px-6 pt-24 pb-10'>
            <h1 className='text-4xl md:text-5xl xl:text-6xl font-bold tracking-tight mb-12 flex flex-col gap-4'>
                <p className='capitalize'>Bring creative projects to life on</p>
                <p className='text-green-600'>FundMe</p>
            </h1>
            <div className="flex justify-center items-center space-x-2">

                <AddModal />

                <button
                    type="button"
                    className="inline-block px-6 py-2.5 border border-green-600
                font-bold text-xs leading-tight uppercase text-green-600
                rounded-full shadow-md bg-transparent hover:bg-green-700
              hover:text-white"
                >
                    <Link href='#campaigns'>
                        Back Campaigns
                    </Link>
                </button>
            </div>

            <div className="flex justify-center items-center mt-10">
                <div
                    className="flex flex-col justify-center items-center 
                    h-20 border shadow-md w-full"
                >
                    <span
                        className="text-lg font-bold text-green-900 
                        leading-5"
                    >
                        {stats.totalCampaigns}
                    </span>
                    <span>Campaigns</span>
                </div>

                <div
                    className="flex flex-col justify-center items-center 
                    h-20 border shadow-md w-full"
                >
                    <span
                        className="text-lg font-bold text-green-900 
                        leading-5"
                    >
                        {stats.totalBackings}
                    </span>
                    <span>Backings</span>
                </div>

                <div
                    className="flex flex-col justify-center items-center
                    h-20 border shadow-md w-full"
                >
                    <span
                        className="text-lg font-bold text-green-900
                        leading-5"
                    >
                        {stats.totalDonations} ETH
                    </span>
                    <span>Donated</span>
                </div>

            </div>
        </div>
    )
}

export default Hero
