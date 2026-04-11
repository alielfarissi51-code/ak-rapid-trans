import { useEffect } from "react";
import { getCommandes } from "../services/api";

function Commandes() {
    useEffect(() => {
        getCommandes()
            .then((data) => console.log(data));
    }, []);
    return (
        <div>
            {data.map(c=>(<p key={c.id}>{c.lieu_depart} to {c.lieu_arrivee}</p>))}
        </div>
    );
}
export default Commandes;