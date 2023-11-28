import React from 'react'
import { Backer } from '@/utils/actions'
import Tooltip from '@mui/material/Tooltip'
import { BsQrCode } from 'react-icons/bs'
import { truncateText } from '@/utils'
import { FaEthereum } from 'react-icons/fa'
import { parseISO, formatDistanceToNow } from 'date-fns'

interface Props {
    backer: Backer
}

const BackerCard = ({ backer }: Props) => {
    const dt = parseISO(backer.timestamp)
    return (
        <tr className="border-b border-gray-200">

            <td className="text-sm font-light px-6 py-4 whitespace-nowrap">
                <div className="flex justify-start items-center space-x-2">
                    <Tooltip title={backer.owner} placement="top">
                        <div>
                            <BsQrCode />
                        </div>
                    </Tooltip>
                    <Tooltip title={backer.owner} placement="top">
                        <span>{truncateText(backer.owner, 4, 4, 11)}</span>
                    </Tooltip>
                </div>
            </td>

            <td className="text-sm font-light px-6 py-4 whitespace-nowrap">
                <small className="flex justify-start items-center space-x-1">
                    <FaEthereum />
                    <span className="text-gray-700 font-medium">
                        {backer.contribution} ETH
                    </span>
                </small>
            </td>

            <td className="text-sm font-light px-6 py-4 whitespace-nowrap">
                {backer.refunded ? 'Yes' : 'No'}
            </td>

            <td className="text-sm font-light px-6 py-4 whitespace-nowrap">
                <div>{formatDistanceToNow(dt)} ago</div>
            </td>
        </tr>
    )
}

export default BackerCard
