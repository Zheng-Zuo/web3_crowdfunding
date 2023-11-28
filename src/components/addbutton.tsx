"use client"

import { useGlobalStates } from '@/providers/GlobalStatesProvider';
import { BsPlusLg } from 'react-icons/bs'

const AddButton = () => {

    const { openAdd, setOpenAdd } = useGlobalStates();

    return (
        <div className="fixed right-10 bottom-10 flex space-x-2 justify-center">
            <button
                type="button"
                className="flex justify-center items-center w-9 h-9 bg-green-600
                text-white font-medium text-xs leading-tight uppercase
                rounded-full shadow-md hover:bg-green-700"
                onClick={() => setOpenAdd(true)}
            >
                <BsPlusLg className='font-bold' size={20} />
            </button>
        </div>
    )
}

export default AddButton