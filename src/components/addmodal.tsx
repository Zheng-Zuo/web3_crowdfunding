"use client"

import * as React from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import { FaTimes } from 'react-icons/fa';
import TextField from '@mui/material/TextField';
import { useCallback, useState, useRef, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { Dayjs } from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useGlobalStates } from '@/providers/GlobalStatesProvider';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addValidation } from '@/utils/formschema';
import FormHelperText from "@mui/material/FormHelperText";
import { uploadImage } from '@/utils';
import { Alert, CircularProgress } from '@mui/material';
import { useAccount, useNetwork } from 'wagmi';
import { ethers } from 'ethers';
import { createCampaign, parseErrorMessages } from '@/utils/actions';
import Image from 'next/image'

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

export default function AddModal() {

  const createTx = createCampaign()
  const { address } = useAccount()
  const { chain } = useNetwork()

  const { openAdd, setOpenAdd, errorConnect, setErrorConnect } = useGlobalStates();
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [scrollTop, setScrollTop] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);
  const handleOpen = () => setOpenAdd(true);
  const handleClose = () => setOpenAdd(false);

  interface inputProps {
    title: string | null;
    description: string | null;
    cost: string | null;
    image: string | null;
    expireDate: Dayjs | null;
  }

  const { control, setValue, handleSubmit, formState: { errors }, reset } = useForm<inputProps>({
    resolver: zodResolver(addValidation),
    defaultValues: {
      title: '',
      description: '',
      cost: '',
      image: '',
      expireDate: null,
    }
  });

  //image upload 
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length) {
      const image_file = acceptedFiles[0]
      setImageFile(image_file)
      const imageURL = URL.createObjectURL(image_file)
      setValue('image', imageURL)
    };
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: {
      "image/*": ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg']
    }
  });

  const onSubmit = async (inputData: inputProps) => {

    if (address && chain && chain.id === 11155111) {
      console.log(`Address: ${address} is connected on ${chain.name}`)
      setAlertMessage(null)
      setErrorConnect(false)

      setUploading(true)
      if (!imageFile ||
        !inputData.title ||
        !inputData.cost ||
        !inputData.expireDate ||
        !inputData.description
      ) return
      const firebaseImageUrl: string = await uploadImage(imageFile)
      setUploading(false)

      await createTx.writeAsync({
        args: [
          inputData.title,
          inputData.description,
          firebaseImageUrl,
          ethers.parseEther(inputData.cost),
          inputData.expireDate?.unix(),
        ]
      }).then((result) => {
        reset()
        setImageFile(null)
        setAlertMessage('Campaign created successfully!')
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
                text-white font-bold text-xs leading-tight uppercase
                rounded-full shadow-md hover:bg-green-700"
        onClick={handleOpen}
      >
        Add Campaign
      </button>

      <Modal
        open={openAdd}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} ref={modalContentRef}>
          <form onSubmit={handleSubmit(onSubmit)} className='h-[700px] max-sm:h-[500px] text-gray-900'>
            <div className="flex justify-between items-center">
              <p className="font-semibold">Add Campaign</p>
              <button
                onClick={handleClose}
                type="button"
                className="border-0 bg-transparent focus:outline-none"
              >
                <FaTimes />
              </button>
            </div>

            {(alertMessage && (errorConnect || createTx.isSuccess || createTx.isError)) && (
              <Alert severity={
                errorConnect || createTx.isError ? 'error' : 'success'
              } sx={{ mt: 2 }}>
                {alertMessage}
              </Alert>
            )}

            <div className={`flex justify-center items-center mt-5 w-full h-[40%] bg-gray-200 border-dashed border-4 ${errors.image ? 'border-red-500' : 'border-gray-300'} rounded-xl}`}>
              <Controller
                name="image"
                control={control}
                render={({ field }) => (
                  <div {...getRootProps()} className="w-full h-full flex justify-center items-center">
                    <input {...getInputProps()} />
                    {
                      field.value ?
                        <div className='relative w-full h-full'>
                          <Image
                            src={field.value}
                            alt="img"
                            className='object-contain w-full h-full object-center absolute'
                            fill
                          />
                        </div> :
                        isDragActive ?
                          <p className='p-4'>Drop the image here ...</p> :
                          <p className='p-4'>Drag 'n' drop your project image, or click to select images</p>
                    }
                  </div>
                )}
              />
            </div>
            {errors.image &&
              <FormHelperText
                error
                sx={{ ml: 2 }}>
                {errors.image.message}
              </FormHelperText>}

            <div className="flex justify-between items-center mt-5">
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    id="title"
                    label="Title"
                    variant="outlined"
                    size="small"
                    inputProps={{ maxLength: 500 }}
                    sx={inputStyle}
                    error={!!errors.title}
                    helperText={errors.title?.message}
                  />
                )}
              />
            </div>

            <div className="flex justify-between items-center mt-5">
              <Controller
                name="cost"
                control={control}
                rules={{ min: 0.1 }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    label="Cost (ETH)"
                    size="small"
                    inputProps={{ step: 0.1, min: 0.1, }}
                    sx={inputStyle}
                    error={!!errors.cost}
                    helperText={errors.cost?.message}
                  />
                )}
              />
            </div>

            <div className="flex justify-between items-center mt-5">
              <Controller
                name="expireDate"
                control={control}
                render={({ field }) => (
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Expire Date"
                      value={field.value}
                      onChange={(newValue) => field.onChange(newValue)}
                      slotProps={{
                        textField: {
                          size: 'small',
                          error: !!errors.expireDate,
                          helperText: errors.expireDate?.message
                        }
                      }}
                      sx={inputStyle}
                    />
                  </LocalizationProvider>
                )}
              />
            </div>

            <div className="flex justify-between items-center mt-5">
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    id="description"
                    label="Description"
                    multiline
                    maxRows={10}
                    minRows={4}
                    size="small"
                    inputProps={{ maxLength: 5000 }}
                    sx={inputStyle}
                    error={!!errors.description}
                    helperText={errors.description?.message}
                  />
                )}
              />
            </div>

            {(createTx.isLoading || uploading) ?
              <div className="flex items-center w-full justify-center mt-5 mb-5">
                <CircularProgress />
              </div> :
              <button
                type="submit"
                className="inline-block px-6 py-2.5 bg-green-600
              text-white font-medium text-md leading-tight
                rounded-full shadow-md hover:bg-green-700 mt-5 mb-5 w-full"
              >
                Submit Project
              </button>
            }


          </form>
        </Box>
      </Modal>
    </div>
  );
}