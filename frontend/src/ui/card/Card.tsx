import { useCardLookUp } from "../../context/cardLookUp.tsx";
import type { Aspect, CardActive, CardStats, CardUID } from "../../models/game.ts";
import { Description, Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { useState } from 'react'
import "./Card.css"
import { Keyword, type CardKeyword, type Buff } from "../../models/abilities.ts";

interface Props {
    card: CardUID | CardActive,
    clickFunction: any,
    cardArea?: CardArea,
    resources?: number,
    ownedAspects?: Aspect[],
}

export enum CardArea {
    ARENA,
    HAND,
}

export default function Card({ card, clickFunction, cardArea, resources, ownedAspects }: Props) {
    let url: string = ""
    let aspectColor: string = ""
    let uid: CardUID = ""
    let damage: string = ""
    let ready = true
    let affordable = true
    let sentinal = false
    let unattackable = false

    let [isOpen, setIsOpen] = useState(false)
    const { data, setValue } = useCardLookUp();

    let checkPriceCard = (card: CardStats): boolean => {
        console.log("check price card", card, resources)
        if (resources! < card.cost) {
            return false
        }
        return true
    }

    if (typeof card === "string") {
        uid = card as CardUID
        if (data[uid]) {
            if (data[uid]?.imgURL) {
                url = data[uid]?.imgURL!
            }
            if (data[uid]?.aspectCost) {
                aspectColor = data[uid]?.aspectCost[0] || "" as any
                if (cardArea == CardArea.HAND)
                    affordable = checkPriceCard(data[uid]!)
            }
        } else {
            if (uid) {
                setValue(uid)
            }
            return (<div></div>)
        }
    } else {
        url = card.imgURL!
        uid = card.cardUid;
        aspectColor = card.aspectCost[0] || "" as any
        ready = card.ready
        if (card.damage > 0) {
            damage = String(card.damage)
        }
        if (card.keywords.find((item: CardKeyword) => item.keyword == Keyword.SENTINAL))
            sentinal = true
        if (card.buffs.find((item: Buff) => item.keyword?.keyword == Keyword.SENTINAL))
            unattackable = true

        if (card.keywords.find((item: CardKeyword) => item.keyword == Keyword.UNATTACKABLE))
            unattackable = true
        if (card.buffs.find((item: Buff) => item.keyword?.keyword == Keyword.UNATTACKABLE))
            unattackable = true
    }

    // If card is CardActive, new check


    let loaded = ()  => {
        console.log("anything2",uid)
        return true
    }


    return (
        <div className='c'>
            <p className="damage-text">
                {damage}
            </p>
            <img onClick={(event: any) => {
                console.log("event", event)
                clickFunction()
                // setIsOpen(true)
            }}
                onContextMenu={(event: any) => {
                    event.preventDefault()
                    setIsOpen(true)
                    console.log("event2", event)
                    return false
                }}
                // onLoad={()=>loaded()}
                
                src={url}
                alt="card"
                className={"a" + (ready ? "" : " unready")
                    + (affordable ? "" : " costly")
                    + (sentinal ? " sentinal" : "")
                    + (unattackable ? " unattackable" : "")
                }
            ></img>
            <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
                <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
                    <DialogPanel className={"max-w-lg space-y-4 border bg-white p-12 card-modal card-color-" + aspectColor}>
                        <DialogTitle className="text-white">{uid}</DialogTitle>
                        {/* <Description>This will permanently deactivate your account</Description> */}
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