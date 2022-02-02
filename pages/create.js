import Link from "next/link";
import { useEffect, useState } from "react"

async function create(set,sset) {
    console.log("CFCC")
    if (typeof window!==undefined) {
        console.log("DDD")
        console.log(typeof window===undefined,typeof window!==undefined)
        const contest = document.getElementById("contest").value;
        const friends = document.getElementById("friends").value;
        const start = document.getElementById("start").value;
        const end = document.getElementById("end").value;
        const url = `https://hagerondev.github.io/atcoderfriends/?contest=${contest}&friends=${friends}&start=${start}&end=${end}`;
        // const srurl = "http://is.gd/create.php?format=simple&format=json&url="+url
        // console.log(srurl,encodeURI(srurl))
        // const res = await fetch("http://tinyurl.com/api-create.php?url="+url);
        // console.log(res)
        // const d = await res.json()
        set(url)
        sset(url)
        console.log(url)
        // sset(d.shorturl)
        // console.log(d)
    }
}

export default function Home() {
    const [create_url, urlset] = useState("https://hagerondev.github.io/atcoderfriends/")
    const [screate_url, surlset] = useState("https://hagerondev.github.io/atcoderfriends/")
    const [res, resset] = useState("");

    useEffect(() => {
        resset(
            <div>
                <div className="text-xl">URL : <Link href={create_url}><a className="underline">{create_url}</a></Link></div>
                <div className="text-xl">短縮 : <Link href={screate_url}><a className="underline">{screate_url}</a></Link></div>
            </div>
        )
    },[create_url])

    return (
        <div className="max-w-screen-sm text-center mx-auto">
            <h1 className="text-3xl my-4">AtCoder Friends 作成サイト</h1>
            <div className="my-2">
                <label>コンテスト名：<input type="text" id="contest" className="border-black border"/></label>
            </div>
            <div className="my-2">
                <label>参加者：<input type="text" id="friends" className="border-black border"/></label>
                <div>※カンマ(,)区切り</div>
            </div>
            <div className="my-2">
                <label>開始UNIX TIME：<input type="text" id="start" className="border-black border"/></label>
            </div>
            <div className="my-2">
                <label>終了UNIX TIME：<input type="text" id="end" className="border-black border"/></label>
            </div>
            <button onClick={(e) => create(urlset, surlset)}>コンテストページ作成</button>
            <div className="my-2">
                {res}
            </div>
        </div>
    )
}
