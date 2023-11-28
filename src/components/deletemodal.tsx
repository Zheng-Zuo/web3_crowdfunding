"use client"

import * as React from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import { FaTimes } from 'react-icons/fa';
import { useGlobalStates } from '@/providers/GlobalStatesProvider';
import { deleteCampaign, parseErrorMessages } from '@/utils/actions';
import { useAccount, useNetwork } from 'wagmi';
import { Alert, CircularProgress } from '@mui/material';
import { useEffect, useRef, useState } from 'react';

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 500,
  bgcolor: 'background.paper',
  boxShadow: '0px 10px 15px -3px rgba(0,0,0,0.7), 0px 4px 6px -2px rgba(0,0,0,0.5)', // shadow-xl
  borderRadius: '1.5rem',
  p: 4,
  '@media (max-width:600px)': {
    width: '95%',
    height: '95%',
  },
  overflowY: 'auto',
  maxHeight: '90vh',
};

const inputStyle = {
  width: "100%",
  "& .MuiOutlinedInput-root": {
    borderRadius: '1em',
    backgroundColor: '#E5E7EB',
  },
}


interface Props {
  id: string;
  status: number;
  imageURL: string;
  title: string;
}

export default function DeleteModal({ id, status, imageURL, title }: Props) {

  const deleteTx = deleteCampaign()
  const { address } = useAccount()
  const { chain } = useNetwork()

  const [openDelete, setOpenDelete] = useState(false);
  const { errorConnect, setErrorConnect } = useGlobalStates();
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [scrollTop, setScrollTop] = useState(false);
  const [isdeleted, setIsDeleted] = useState(false);
  const modalContentRef = useRef<HTMLDivElement>(null);
  const handleOpen = () => setOpenDelete(true);
  const handleClose = () => setOpenDelete(false);

  const handleClick = async () => {
    if (address && chain && chain.id === 11155111) {
      console.log(`Address: ${address} is connected on ${chain.name}`)
      setAlertMessage(null)
      setErrorConnect(false)

      await deleteTx.writeAsync({
        args: [parseInt(id)],
      }).then((result) => {
        setAlertMessage('Campaign deleted successfully!')
        setScrollTop(true)
        setIsDeleted(true)
      }).catch((err) => {
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
      modalContentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      setScrollTop(false)
    }
  }, [scrollTop]);


  return (
    <div>
      <button
        type="button"
        className="inline-block px-6 py-2.5 bg-red-600
                text-white font-medium text-xs leading-tight uppercase
                rounded-full shadow-md hover:bg-red-700"
        onClick={handleOpen}
      >
        Delete
      </button>

      <Modal
        open={openDelete}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} ref={modalContentRef}>
          <div className='h-[700px] max-sm:h-[500px] text-gray-900'>

            <div className="flex justify-between items-center">
              <p className="font-semibold">{title}</p>
              <button
                onClick={handleClose}
                type="button"
                className="border-0 bg-transparent focus:outline-none"
              >
                <FaTimes />
              </button>
            </div>

            {(alertMessage && (errorConnect || deleteTx.isSuccess || deleteTx.isError)) && (
              <Alert severity={
                errorConnect || deleteTx.isError ? 'error' : 'success'
              } sx={{ mt: 2 }}>
                {alertMessage}
              </Alert>
            )}

            <div className="flex justify-center items-center mt-5 w-full h-[40%] rounded-xl overflow-hidden">
              <img src={imageURL} className='object-contain w-full h-full' />
            </div>

            <div className="flex justify-between items-center mt-5 flex-col gap-2">
              {!isdeleted ?
                <>
                  <p>Are you sure?</p>
                  <small className="text-red-400">This is irreversible!</small>
                </> :
                <p>Sorry to see you go, good luck with your future projects!</p>
              }
            </div>

            {deleteTx.isLoading ?
              <div className="flex items-center w-full justify-center mt-5 mb-5">
                <CircularProgress />
              </div> :
              isdeleted ? null :
                <button
                  type="submit"
                  className="inline-block px-6 py-2.5 bg-red-600
                          text-white font-medium text-xs leading-tight uppercase
                          rounded-full shadow-md hover:bg-red-700 mt-5 mb-5 w-full"
                  onClick={handleClick}
                >
                  Delete Project
                </button>
            }
          </div>
        </Box>
      </Modal>
    </div >
  );
}