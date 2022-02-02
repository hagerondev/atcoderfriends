import Head from 'next/head'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

import React, { useRef, useState, useEffect} from 'react';
import { type } from 'os';

ChartJS.register(ArcElement, Tooltip, Legend);

const user_color = {};

async function div_friends(friends, state) {
  if (friends===undefined) return null;
  const users = friends.split(",");
  for (const user of users) {
    let url = "https://kyopro-ratings.herokuapp.com/json?atcoder="+user
    console.log(url)
    const res = await fetch(url);
    const data = await res.json();
    //console.log("API",data)
    const color = data.atcoder.color;
    user_color[user] = color
    await new Promise(resolve => setTimeout(resolve, 300))
  }
  state(
    <div className='text-center text-lg lg:text-xl'>
      <div>参加者</div>
      <div>
        {Object.keys(user_color).map( u => {
          const c = user_color[u];
          return <Link href={"https://atcoder.jp/users/"+u} key={u+c}><a className={'mx-2 hover:underline'} style={{color: c}}>{u}</a></Link>
        })}
      </div>
    </div>
  )
}

function div_date(start,end) {
  if(start===undefined || end===undefined) return null;
  return (
    <div className='text-center text-lg lg:text-xl'>
      <div>期間</div>
      <div>
        <span>{unix_to_str(start)}</span> ～ <span className='inline-block'>{unix_to_str(end)}</span>
      </div>
    </div>
  )
}

function BasePie(labels) {
  const graphColors = [
    [255, 99, 132],
    [54, 162, 235],
    [255, 206, 86],
    [75, 192, 192],
    [153, 102, 255],
    [255, 159, 64],
  ]
  let chartData = {}
  chartData.labels = labels;
  chartData.datasets = [{}];
  chartData.datasets[0].label = '# of Votes';
  chartData.datasets[0].backgroundColor = [];
  chartData.datasets[0].borderColor = [];
  for (const c of graphColors) {
    chartData.datasets[0].backgroundColor.push(`rgba(${c[0]},${c[1]},${c[2]},0.5)`);
    chartData.datasets[0].borderColor.push(`rgba(${c[0]},${c[1]},${c[2]},1)`);
  }
  chartData.datasets[0].borderWidth = 1;

  return chartData;
}

function div_point(d) {
  const pie = BasePie(d.labels);
  pie.datasets[0].data = d.point_data;
  console.log("point 更新")
  return <Pie data={pie} />
}

function div_cnt(d) {
  const pie = BasePie(d.labels);
  pie.datasets[0].data = d.cnt_data;
  return <Pie data={pie} />
}

const unix_to_str = (t) => {
  const d = new Date(t*1000);
  return d.toLocaleDateString() + "\n" + d.toLocaleTimeString();
}

function div_hist(d) {
  if (d.hist===undefined) return null
  
  const get_contest = (p) => {
    const t = p.split("_");
    const a = t.slice(0,-1).join("_");
    return a;
  }
  const problem_id_to_str = (p) => {
    const t = p.split("_");
    const a = t.slice(0,-1).join("_")
    const b = t[t.length-1]
    //console.log(a,b)
    return a + "-" + b
  }
    return (
      <tbody>
        {d.hist.map(d => {
          return (
            <tr key={d.id}>
              <td className='w-1/3 px-1'>{unix_to_str(d.epoch_second)}</td>
              <td className='w-1/3 px-1'><Link href={`https://atcoder.jp/contests/${get_contest(d.problem_id)}/tasks/${d.problem_id}`}><a className='hover:underline'>{problem_id_to_str(d.problem_id.toUpperCase())}</a></Link></td>
              <td className='w-1/3 px-1'><Link href={`https://atcoder.jp/contests/${get_contest(d.problem_id)}/submissions/${d.id}`}><a className='hover:underline' style={{color: user_color[d.user_id]}}>{d.user_id}</a></Link></td>
            </tr>
          )
        })}
      </tbody>
    )
}


async function get_data(friends,f_state,from_sec=-1,to_sec=-1) {
  if (friends===undefined) return null;
  console.log("get_data start",friends)
  // if (from_sec==-1) {
  //   from_sec = Math.round(new Date().getTime()/1000-60*60*24*31*1);
  //   console.log(from_sec)
  // }
  if (to_sec==-1) {
    to_sec = new Date().getTime()/1000;
  }
  const view_data = {
    labels: [],
    point_data: [],
    cnt_data: [],
  }
  let sumarr = [];
  for (const friend of friends.split(",")) {
    let url = `https://kenkoooo.com/atcoder/atcoder-api/v3/user/submissions?user=${friend}&from_second=${from_sec}`
    console.log(url)
    const res = await fetch(url)
    const r = await res.json()
    view_data.labels.push(friend)
    let p_sum = 0;
    let c_sum = 0;
    for( const p of r ) {
      if (p.epoch_second<=to_sec && p.result==="AC" && ((p.point%10===0 && p.point <= 5000) || (p.problem_id.indexOf("abc")!==-1 || p.problem_id.indexOf("arc")!==-1 || p.problem_id.indexOf("agc")!==-1))) {
        p_sum += p.point;
        c_sum++;
        sumarr.push(p)
      }
    }
    view_data.point_data.push(p_sum)
    view_data.cnt_data.push(r.length)
    //console.log(r)
    console.log("request",friend)
    if (friends.split(",").length===view_data.labels.length) {
      sumarr.sort(function(a,b) {
        return b.epoch_second - a.epoch_second;
      })
      view_data.hist = sumarr;
      console.log("log",view_data)
      f_state(view_data)
      return view_data;
    }
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
}

export default function Home() {
  const router = useRouter();
  const query = router.query;
  const [friends_data, friends_data_state] = useState({})
  const [point_section,point_section_state] = useState(null);
  const [cnt_section, cnt_section_state] = useState(null);
  const [hist_section, hist_section_state] = useState(null);
  const [last_ac, last_ac_state] = useState(-1);

  useEffect(() => {
    //friends_data_state(get_data(query.friends))
    if (friends_data.hist!==undefined && friends_data.hist.length!==0 && last_ac!=friends_data.hist[0].epoch_second) {
      console.log("new data")
      last_ac_state(friends_data.hist[0].epoch_second);
    }else{
      console.log("latest")
    }
  },[friends_data])

  useEffect(() => {
    point_section_state(div_point(friends_data));
    cnt_section_state(div_cnt(friends_data));
    hist_section_state(div_hist(friends_data));
  }, [last_ac])

  useEffect(() => {
    if (query.friends!==undefined) {
      div_friends(query.friends, friends_section_state)
      get_data(query.friends,friends_data_state,query.start,query.end)
      setInterval(() => {
        get_data(query.friends,friends_data_state,query.start,query.end)
      }, 10000+query.friends.split(",").length*1000);
    }
  },[query])

  const [friends_section, friends_section_state] = useState(null);


  return (
    <div className='text-center mx-auto'>
      <div className='bg-white/95 fixed top-0 left-0 right-0 bottom-0 z-10'></div>
      <div className='fixed top-0 left-0 right-0 bottom-0 z-0' style={{"backgroundImage":"url(./atcoder.svg)"}}></div>
      <div className='relative z-50 max-w-screen-sm mx-auto'>
        <h1 className='text-center text-2xl lg:text-4xl mt-4 font-bold'>AtCoder Friends</h1>
        {query.contest?<h2 className='text-center text-2xl lg:text-3xl my-2'>「{query.contest}」</h2>:null}
        <div className='p-2 my-2'>
          {friends_section}
        </div>
        <div className='p-2 my-2'>
          {div_date(query.start, query.end)}
        </div>
        <div className='lg:flex justify-center flex-row'>
          <div className='border-gray-500 border-2 rounded-lg p-4 m-4 basis-160'>
            <h2 className='text-center text-xl mb-2'>合計得点</h2>
            <div className='max-w-sm mx-auto'>
              {point_section}
            </div>
          </div>
          <div className='border-gray-500 border-2 rounded-lg p-4 m-4'>
            <h2 className='text-center text-xl mb-2'>解いた問題数</h2>
            <div className='mx-auto max-w-sm'>
              {cnt_section}
            </div>
          </div>
        </div>
        <div className='border-gray-500 border-2 rounded-lg p-4 m-4'>
          <h2 className='text-center text-xl mb-2'>履歴</h2>
          <table className='mx-auto'>
            {hist_section}
          </table>
        </div>
        
      </div>
    </div>
  )
}
