const GATEWAY='https://iovzxyzjekaikvnkrenz.supabase.co/functions/v1/security-gateway';

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

  const ctl=new AbortController();
  const timer=setTimeout(()=>ctl.abort(),15000);
  try{
    const upstream=await fetch(GATEWAY,{
      method:'POST',
      headers:{'Content-Type':'application/json','Accept':'application/json'},
      body:JSON.stringify(body),
      signal:ctl.signal
    });
    const text=await upstream.text();
    clearTimeout(timer);
    res.status(upstream.status);
    res.setHeader('Content-Type',upstream.headers.get('content-type')||'application/json; charset=utf-8');
    return res.send(text);
  }catch(err){
    clearTimeout(timer);
    const timedOut=err&&err.name==='AbortError';
    return res.status(502).json({ok:false,message:timedOut?'安全校验请求超时':'安全校验服务连接失败',network_error:true});
  }
};
