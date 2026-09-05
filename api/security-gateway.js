const GATEWAY='https://iovzxyzjekaikvnkrenz.supabase.co/functions/v1/security-gateway';
const RETRYABLE=new Set([408,425,429,500,502,503,504]);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

async function callGateway(body){
  const ctl=new AbortController();
  const timer=setTimeout(()=>ctl.abort(),4200);
  try{
    const upstream=await fetch(GATEWAY,{
      method:'POST',
      headers:{'Content-Type':'application/json','Accept':'application/json','User-Agent':'rsjlucky-vercel-gateway/2'},
      body:JSON.stringify(body),
      signal:ctl.signal,
      cache:'no-store'
    });
    const text=await upstream.text();
    return {upstream,text};
  }finally{clearTimeout(timer)}
}

module.exports=async function handler(req,res){
  res.setHeader('Cache-Control','no-store, max-age=0');
  if(req.method!=='POST'){
    res.setHeader('Allow','POST');
    return res.status(405).json({ok:false,message:'Method not allowed'});
  }
  let body=req.body;
  if(typeof body==='string'){
    try{body=JSON.parse(body||'{}')}catch{return res.status(400).json({ok:false,message:'Invalid JSON body'})}
  }
  if(!body||typeof body!=='object'||Array.isArray(body)) body={};

  let lastError=null,lastStatus=0;
  for(let attempt=1;attempt<=3;attempt++){
    try{
      const {upstream,text}=await callGateway(body);
      lastStatus=upstream.status;
      if(RETRYABLE.has(upstream.status)&&attempt<3){
        console.warn('[gateway retry] status',upstream.status,'attempt',attempt);
        await sleep(160*attempt);
        continue;
      }
      console.log('[gateway] status',upstream.status,'attempt',attempt);
      res.status(upstream.status);
      res.setHeader('X-RSJ-Upstream-Attempt',String(attempt));
      res.setHeader('Content-Type',upstream.headers.get('content-type')||'application/json; charset=utf-8');
      return res.send(text);
    }catch(err){
      lastError=err;
      console.warn('[gateway fetch error]',err&&err.name||'Error','attempt',attempt);
      if(attempt<3){await sleep(180*attempt);continue;}
    }
  }
  const timedOut=lastError&&lastError.name==='AbortError';
  return res.status(502).json({ok:false,message:timedOut?'安全校验请求超时':'安全校验服务连接失败',network_error:true,upstream_status:lastStatus||null});
};
