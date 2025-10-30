import { useCardLookUp } from "../../context/cardLookUp.tsx";
import type { CardActive, CardUID } from "../../models/game.ts";

interface Props {
    card: CardUID | CardActive,
    clickFunction: any
}

export default function Card({ card, clickFunction }: Props) {
    let url: string = ""
    let uid: CardUID = ""


    const { data, setValue } = useCardLookUp();

    if (typeof card === "string") {
        uid = card as CardUID
    }

    // If card is CardActive, new check

    if (data[uid]) {
        if (data[uid]?.imgURL) {
            url = data[uid]?.imgURL!
        }
    } else {
        setValue(uid)
        return (<div></div>)
    }



    return (
        <div className='b'>
                <img onClick={(event: any) => {
                    console.log("event", event)
                    clickFunction()
                }}
                onContextMenu={(event: any) => {
                    event.preventDefault()
                    console.log("event2", event)
                    return false
                }}
                src={url}
                alt="card"
                className="a"
            ></img>
        </div>
    )
}