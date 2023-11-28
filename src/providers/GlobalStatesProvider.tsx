"use client"

import { PropsWithChildren, createContext, useContext, useState } from "react"

type ContextState = {
    openAdd: boolean;
    setOpenAdd: (openAdd: boolean) => void;

    openBack: boolean;
    setOpenBack: (openBack: boolean) => void;

    openEdit: boolean;
    setOpenEdit: (openEdit: boolean) => void;

    errorConnect: boolean;
    setErrorConnect: (errorConnect: boolean) => void;

}

export const globalStates = createContext<ContextState | null>(null)

export const GlobalStatesProvider = (props: PropsWithChildren) => {

    const [openAdd, setOpenAdd] = useState(false);
    const [openBack, setOpenBack] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [errorConnect, setErrorConnect] = useState(true);

    const default_value = {
        openAdd,
        setOpenAdd,
        openBack,
        setOpenBack,
        openEdit,
        setOpenEdit,
        errorConnect,
        setErrorConnect,
    }

    return (
        <globalStates.Provider value={default_value}>
            {props.children}
        </globalStates.Provider>
    )
}

export const useGlobalStates = () => {
    const context = useContext(globalStates)
    if (!context) {
        throw new Error("Please use filter provider in the parent element")
    }
    return context
}