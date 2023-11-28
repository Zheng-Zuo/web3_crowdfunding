"use client"

import Image from "next/image";
import { campaignProps, claimRefund, getCampaignById, listenEvents, parseErrorMessages, parsedCampaign, payoutCampaign } from "@/utils/actions";
import { daysRemaining, truncateText } from "@/utils"
import { BsQrCode } from "react-icons/bs";
import { FaEthereum } from 'react-icons/fa'
import Tooltip from '@mui/material/Tooltip';
import BackModal from "./backmodal";
import EditModal from "./editmodal";
import DeleteModal from "./deletemodal";
import { useEffect, useRef, useState } from "react";
import { useAccount, useNetwork } from 'wagmi';
import { Alert, CircularProgress } from '@mui/material';
import { useGlobalStates } from "@/providers/GlobalStatesProvider";


const ProjectDetail = ({ id }: { id: number }) => {
  const [campaign, setCampaign] = useState<campaignProps>({
    id: "",
    owner: "",
    title: "",
    description: "",
    imageURL: "",
    cost: 0,
    raised: 0,
    timestamp: "",
    expiresAt: "",
    numOfBackers: 0,
    status: 0,
  })

  const [isOwner, setIsOwner] = useState(false);
  const { address } = useAccount()

  useEffect(() => {
    if (address === campaign.owner || address === process.env.NEXT_PUBLIC_CONTRACT_OWNER) {
      setIsOwner(true)
    } else {
      setIsOwner(false)
    }
  }, [address, campaign])

  const results = getCampaignById(id)
  const unwatch = listenEvents(results.refetch)

  const payoutTx = payoutCampaign()
  const refundTx = claimRefund()
  const { chain } = useNetwork()
  const { errorConnect, setErrorConnect } = useGlobalStates();
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [scrollTop, setScrollTop] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (results.data && !results.isLoading && results.isSuccess) {
      const parsedData = parsedCampaign(results.data as { [key: string]: any })
      setCampaign(parsedData)
    }
    return () => {
      unwatch?.()
    }
  }, [results.data])

  const handleTransaction = async (transaction: any, args: any[], successMessage: string) => {
    if (address && chain && chain.id === 11155111) {
      console.log(`Address: ${address} is connected on ${chain.name}`)
      setAlertMessage(null)
      setErrorConnect(false)

      await transaction.writeAsync({
        args: args,
      }).then((result: any) => {
        setAlertMessage(successMessage)
        setScrollTop(true)
      }).catch((err: any) => {
        const errorMessage = parseErrorMessages(err)
        setAlertMessage(errorMessage)
        setScrollTop(true)
      })

    } else {
      setErrorConnect(true)
      setAlertMessage('Please connect to the Sepolia testnet')
      setScrollTop(true)
    }
  }

  useEffect(() => {
    if (scrollTop) {
      topRef.current?.scrollIntoView({ behavior: "smooth" });
      setScrollTop(false);
    }
  }, [scrollTop])

  const expired = Date.now() > new Date(campaign.expiresAt).getTime()

  return (
    <section className="pt-24 mb-5 flex justify-center text-gray-900" ref={topRef}>
      <div className="flex justify-center flex-col w-[80%] m-auto">

        {(alertMessage && (
          errorConnect ||
          payoutTx.isSuccess ||
          payoutTx.isError ||
          refundTx.isSuccess ||
          refundTx.isError)) && (
            <Alert severity={
              errorConnect || payoutTx.isError || refundTx.isError ? 'error' : 'success'
            } sx={{ mb: 4 }}>
              {alertMessage}
            </Alert>
          )}

        <div className="flex flex-col  lg:flex-row lg:justify-start lg:items-start">
          <div className="max-lg:w-full flex justify-center items-center">
            <Image
              src={campaign.imageURL}
              alt="img"
              width={512}
              height={256}
              className="lg:mr-6 mb-6"
            />
          </div>

          <div className="flex-1 sm:py-0 py-4">
            <div className="flex flex-col justify-start">
              <h5 className="text-gray-900 text-xl font-medium mb-2">{campaign?.title}</h5>
              <small className="text-gray-500">{
                expired ? 'Expired' : `${daysRemaining(campaign.expiresAt)} left`
              }</small>
            </div>

            <div className="flex flex-row justify-between items-end w-full pt-2 text-gray-900">

              <div className="flex space-x-4">
                <Tooltip title={campaign?.owner} placement="top">
                  <div>
                    <BsQrCode />
                  </div>
                </Tooltip>
                {campaign?.owner ? (
                  <Tooltip title={campaign?.owner} placement="top">
                    <small className="text-gray-700">
                      {truncateText(campaign?.owner, 4, 4, 11)}
                    </small>
                  </Tooltip>
                ) : null}


                <small className="text-gray-500 font-bold">
                  {campaign?.numOfBackers} Backer{campaign?.numOfBackers == 1 ? '' : 's'}
                </small>
              </div>

              <div className="font-bold">
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

            <div>
              <p className="text-sm font-light mt-4">{campaign?.description}</p>
              <div className="w-full overflow-hidden bg-gray-300 mt-4">
                <div
                  className="bg-green-600 text-xs font-medium
                                    text-green-100 text-center p-0.5 leading-none
                                    rounded-l-full h-1 overflow-hidden max-w-full"
                  style={{
                    width: `${(campaign?.raised / campaign?.cost) * 100}%`,
                  }}
                />
              </div>
              <div className="flex justify-between items-center font-bold mt-2">
                <small>{campaign?.raised} ETH Raised</small>
                <small className="flex justify-start items-center">
                  <FaEthereum />
                  <span>{campaign?.cost} ETH</span>
                </small>
              </div>

              <div className="flex justify-start items-center space-x-2 mt-4 flex-wrap gap-2">
                {payoutTx.isLoading ?
                  (<CircularProgress />) : (
                    <>
                      {(campaign?.status == 0 || campaign?.status == 1) && !expired ? (
                        <BackModal id={campaign.id} imageURL={campaign.imageURL} title={campaign.title} />
                      ) : null}

                      {campaign?.status == 1 && isOwner ? (
                        <button
                          type="button"
                          className="inline-block px-6 py-2.5 bg-orange-600
                                    text-white font-medium text-xs leading-tight uppercase
                                    rounded-full shadow-md hover:bg-orange-700"
                          onClick={() => handleTransaction(
                            payoutTx,
                            [parseInt(campaign.id)],
                            'Campaign paid out successfully!'
                          )}
                        >
                          Payout
                        </button>
                      ) : null}
                    </>
                  )}

                {campaign?.status == 0 && !expired && isOwner ? (
                  <>
                    <EditModal
                      id={campaign.id}
                      title={campaign.title}
                      description={campaign.description}
                      cost={campaign.cost}
                      imageURL={campaign.imageURL}
                      expiresAt={campaign.expiresAt}
                    />
                    <DeleteModal
                      id={campaign.id}
                      status={campaign.status}
                      imageURL={campaign.imageURL}
                      title={campaign.title}
                    />
                  </>
                ) : null}

                {refundTx.isLoading ?
                  (<CircularProgress />) : (
                    <>
                      {campaign?.status == 0 && expired && campaign?.numOfBackers > 0 ? (
                        <button
                          type="button"
                          className="inline-block px-6 py-2.5 bg-orange-600
                              text-white font-medium text-xs leading-tight uppercase
                              rounded-full shadow-md hover:bg-orange-700"
                          onClick={() => handleTransaction(
                            refundTx,
                            [parseInt(campaign.id), address],
                            'Backer has been refunded successfully!'
                          )}
                        >
                          Claim Refund
                        </button>
                      ) : null}
                    </>)}

                {campaign?.status == 2 ||
                  campaign?.status == 3 ||
                  campaign?.status == 4 ||
                  (campaign?.numOfBackers == 0 && expired)
                  ? (
                    <button
                      type="button"
                      className="inline-block px-6 py-2.5 bg-gray-600
                                text-white font-medium text-xs leading-tight uppercase
                                rounded-full shadow-md hover:bg-gray-700"
                    >
                      Project Closed
                    </button>
                  ) : null}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

export default ProjectDetail
