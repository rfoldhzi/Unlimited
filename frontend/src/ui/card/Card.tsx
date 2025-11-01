import { useCardLookUp } from "../../context/cardLookUp.tsx";
import type { CardActive, CardUID } from "../../models/game.ts";
import { Description, Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { useState } from 'react'
import "./Card.css"

interface Props {
    card: CardUID | CardActive,
    clickFunction: any
}

export default function Card({ card, clickFunction }: Props) {
    let url: string = ""
    let aspectColor: string = ""
    let uid: CardUID = ""

    let [isOpen, setIsOpen] = useState(false)
    const { data, setValue } = useCardLookUp();

    if (typeof card === "string") {
        uid = card as CardUID
    }

    // If card is CardActive, new check

    if (data[uid]) {
        if (data[uid]?.imgURL) {
            url = data[uid]?.imgURL!
        }
        if (data[uid]?.aspectCost) {
            aspectColor = data[uid]?.aspectCost[0] || ""
        }
    } else {
        if (uid) {
            setValue(uid)
        }
        return (<div></div>)
    }



    return (
        <div className='b'>
            <img onClick={(event: any) => {
                    console.log("event", event)
                    // clickFunction()
                    setIsOpen(true)
                }}
                onContextMenu={(event: any) => {
                    // event.preventDefault()
                    // setIsOpen(true)
                    console.log("event2", event)
                    return false
                }}
                src={url}
                alt="card"
                className="a"
            ></img>
            <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
                <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
                    <DialogPanel className={"max-w-lg space-y-4 border bg-white p-12 card-modal card-color-" + aspectColor}>
                        {/* <DialogTitle className="font-bold">Deactivate account</DialogTitle>
                        <Description>This will permanently deactivate your account</Description> */}
                        {/* <p>Are you sure you want to deactivate your account? All of your data will be permanently removed.</p> */}
                        <img
                            src={url}
                            alt="card"
                            className="preview-card"
                        ></img>
                        <div className="flex gap-4 text-white ">
                            <button onClick={() => setIsOpen(false)}>Cancel</button>
                            <button onClick={() => { setIsOpen(false); clickFunction() }}>Use</button>
                        </div>
                    </DialogPanel>
                </div>
            </Dialog>
        </div>
    )
}