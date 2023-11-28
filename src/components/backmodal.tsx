"use client"

import * as React from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import { FaTimes } from 'react-icons/fa';
import TextField from '@mui/material/TextField';
import { useGlobalStates } from '@/providers/GlobalStatesProvider';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { backValidation } from '@/utils/formschema';
import { useAccount, useNetwork } from 'wagmi';
import { useEffect, useRef, useState } from 'react';
import { backCampaign, parseErrorMessages } from '@/utils/actions';
import { ethers } from 'ethers';
import { Alert, CircularProgress } from '@mui/material';

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
  imageURL: string;
  title: string;
}

export default function BackModal({ id, imageURL, title }: Props) {

  const backTx = backCampaign()
  const { address } = useAccount()
  const { chain } = useNetwork()

  const { openBack, setOpenBack, errorConnect, setErrorConnect } = useGlobalStates();
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [scrollTop, setScrollTop] = useState(false);
  const modalContentRef = useRef<HTMLDivElement>(null);

  const handleOpen = () => setOpenBack(true);
  const handleClose = () => setOpenBack(false);

  interface inputProps {
    amount: string;
  }

  const { control, handleSubmit, formState: { errors }, reset } = useForm<inputProps>({
    resolver: zodResolver(backValidation),
    defaultValues: {
      amount: "",
    }
  });


  const onSubmit = async (inputData: inputProps) => {

    if (address && chain && chain.id === 11155111) {
      console.log(`Address: ${address} is connected on ${chain.name}`)
      setAlertMessage(null)
      setErrorConnect(false)

      await backTx.writeAsync({
        args: [parseInt(id)],
        value: ethers.parseEther(inputData.amount),
      }).then((result) => {
        reset()
        setAlertMessage('Campaign backed successfully!')
        setScrollTop(true)
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
        className="inline-block px-6 py-2.5 bg-green-600
                text-white font-medium text-xs leading-tight uppercase
                rounded-full shadow-md hover:bg-green-700"
        onClick={handleOpen}
      >
        Back Project
      </button>

      <Modal
        open={openBack}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} ref={modalContentRef}>
          <form onSubmit={handleSubmit(onSubmit)} className='h-[700px] max-sm:h-[500px] text-gray-900'>
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

            {(alertMessage && (errorConnect || backTx.isSuccess || backTx.isError)) && (
              <Alert severity={
                errorConnect || backTx.isError ? 'error' : 'success'
              } sx={{ mt: 2 }}>
                {alertMessage}
              </Alert>
            )}

            <div className="flex justify-center items-center mt-5 w-full h-[40%] rounded-xl overflow-hidden">
              <img src={imageURL} className='object-contain w-full h-full' />
            </div>

            <div className="flex justify-between items-center mt-5">
              <Controller
                name="amount"
                control={control}
                rules={{ min: 0.001 }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    label="Amount (ETH)"
                    size="small"
                    inputProps={{ step: 0.001, min: 0.001 }}
                    sx={inputStyle}
                    error={!!errors.amount}
                    helperText={errors.amount?.message}
                  />
                )}
              />
            </div>

            {backTx.isLoading ?
              <div className="flex items-center w-full justify-center mt-5 mb-5">
                <CircularProgress />
              </div> :
              <button
                type="submit"
                className="inline-block px-6 py-2.5 bg-green-600
                                text-white font-medium text-md leading-tight
                                rounded-full shadow-md hover:bg-green-700 mt-5 mb-5 w-full"
              >
                Back Project
              </button>
            }

          </form>
        </Box>
      </Modal>
    </div >
  );
}