import { daysRemaining, truncateText } from '@/utils'
import Link from 'next/link'
import { BsQrCode } from 'react-icons/bs'
import { FaEthereum } from 'react-icons/fa'
import Tooltip from '@mui/material/Tooltip'
import { campaignProps } from '@/utils/actions'
import Image from 'next/image'

const ProjectCard = (campaign: campaignProps) => {
  const expired = new Date() > new Date(campaign.expiresAt)

  return (
    <div className="rounded-lg shadow-lg bg-white w-64 m-4">
      <Link href={`/project/${campaign.id}`}>
        <div className='h-40 relative'>
          <Image
            src={campaign.imageURL}
            alt={campaign.title}
            className="rounded-t-lg absolute top-0 left-0 w-full h-full object-cover object-center"
            fill
          />
        </div>
        <div className='pt-4 px-4 flex flex-col gap-2'>
          <Tooltip title={campaign?.title} placement="top">
            <h5 className='text-gray-700'>
              {truncateText(campaign.title, 25, 0, 28)}
            </h5>
          </Tooltip>
          <div className='flex flex-col text-gray-700'>
            <div className='flex justify-start space-x-2 items-center mb-2'>
              <Tooltip title={campaign?.owner} placement="top">
                <div>
                  <BsQrCode />
                </div>
              </Tooltip>
              <Tooltip title={campaign?.owner} placement="top">
                <small>{truncateText(campaign.owner, 4, 4, 11)}</small>
              </Tooltip>
            </div>
          </div>
          <small className='text-gray-500'>
            {expired ? 'Expired' : daysRemaining(campaign.expiresAt) + ' left'}
          </small>
        </div>

        <div className="w-full bg-gray-300 overflow-hidden mt-1">
          <div
            className="bg-green-600 text-xs font-medium
                    text-green-100 text-center p-0.5 leading-none
                    rounded-l-full"
            style={{ width: `${(campaign.raised / campaign.cost) * 100}%` }}
          />
        </div>

        <div
          className="flex justify-between items-center 
                font-bold mt-1 text-gray-700 px-4 py-1"
        >
          <small>{campaign.raised} ETH Raised</small>
          <small className="flex justify-start items-center">
            <FaEthereum />
            <span>{campaign.cost} ETH</span>
          </small>
        </div>
        <div
          className="flex justify-between items-center flex-wrap 
                mb-2 text-gray-500 font-bold px-4"
        >
          <small>
            {campaign.numOfBackers} Backer{campaign.numOfBackers === 1 ? '' : 's'}
          </small>
          <div>
            {expired ? (
              <small className="text-red-500">Expired</small>
            ) : campaign?.status == 0 ? (
              <small className="text-gray-500">Open</small>
            ) : campaign?.status == 1 ? (
              <small className="text-green-500">Accepted</small>
            ) : campaign?.status == 2 ? (
              <small className="text-gray-500">Reverted</small>
            ) : campaign?.status == 3 ? (
              <small className="text-red-500">Deleted</small>
            ) : (
              <small className="text-orange-500">Paid</small>
            )}
          </div>
        </div>
      </Link>
    </div>

  )
}

export default ProjectCard
