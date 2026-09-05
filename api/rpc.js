const SUPABASE_URL='https://iovzxyzjekaikvnkrenz.supabase.co';
const SUPABASE_KEY='sb_publishable_Kwrp6dXTWRoBxDx7uyacuQ_QTp10qkt';
const RETRYABLE=new Set([408,425,429,500,502,503,504]);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

async function callUpstream(name,body,attempt){
  const ctl=new AbortController();
  const timer=setTimeout(()=>ctl.abort(),4200);
  try{
    const upstream=await fetch(`${SUPABASE_URL}/rest/v1/rpc/${encodeURIComponent(name)}`,{
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        'apikey':SUPABASE_KEY,
        'Accept':'application/json',
        'User-Agent':'rsjlucky-vercel-rpc/2'
      },
      body:JSON.stringify(body),
      signal:ctl.signal,
      cache:'no-store'
    });
    const text=await upstream.text();
    return {upstream,text,attempt};
  }finally{
    clearTimeout(timer);
  }
}

module.exports=async function handler(req,res){
  res.setHeader('Cache-Control','no-store, max-age=0');
  if(req.method!=='POST'){
    res.setHeader('Allow','POST');
    return res.status(405).json({ok:false,message:'Method not allowed'});
  }
  const name=String((req.query&&req.query.name)||'').trim();
  if(!/^[A-Za-z0-9_]{1,100}$/.test(name)){
    return res.status(400).json({ok:false,message:'Invalid RPC name'});
  }
  let body=req.body;
  if(typeof body==='string'){
    try{body=JSON.parse(body||'{}')}catch{return res.status(400).json({ok:false,message:'Invalid JSON body'})}
  }
  if(!body||typeof body!=='object'||Array.isArray(body)) body={};

  let lastError=null;
  let lastStatus=0;
  for(let attempt=1;attempt<=3;attempt++){
    try{
      const {upstream,text}=await callUpstream(name,body,attempt);
      lastStatus=upstream.status;
      if(RETRYABLE.has(upstream.status)&&attempt<3){
        console.warn('[rpc retry]',name,'status',upstream.status,'attempt',attempt);
        await sleep(160*attempt);
        continue;
      }
      console.log('[rpc]',name,'status',upstream.status,'attempt',attempt);
      res.status(upstream.status);
      res.setHeader('X-RSJ-Upstream-Attempt',String(attempt));
      res.setHeader('Content-Type',upstream.headers.get('content-type')||'application/json; charset=utf-8');
      return res.send(text);
    }catch(err){
      lastError=err;
      console.warn('[rpc fetch error]',name,err&&err.name||'Error','attempt',attempt);
      if(attempt<3){await sleep(180*attempt);continue;}
    }
  }
  const timedOut=lastError&&lastError.name==='AbortError';
  return res.status(502).json({ok:false,message:timedOut?'数据服务请求超时':'数据服务连接失败',network_error:true,upstream_status:lastStatus||null});
};
