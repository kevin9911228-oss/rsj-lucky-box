const SUPABASE_URL='https://iovzxyzjekaikvnkrenz.supabase.co';
const SUPABASE_KEY='sb_publishable_Kwrp6dXTWRoBxDx7uyacuQ_QTp10qkt';
module.exports=async function handler(req,res){
  res.setHeader('Cache-Control','no-store, max-age=0');
  try{
    const r=await fetch(SUPABASE_URL+'/rest/v1/rpc/manager_login',{
      method:'POST',
      headers:{'Content-Type':'application/json','apikey':SUPABASE_KEY,'Accept':'application/json'},
      body:JSON.stringify({p_username:'__rsj_health__',p_pin:'__invalid__'})
    });
    const t=await r.text();
    let parsed=null;try{parsed=JSON.parse(t)}catch{}
    const upstreamWorking=r.status===200&&parsed&&parsed.ok===false;
    return res.status(upstreamWorking?200:502).json({ok:upstreamWorking,upstream_status:r.status});
  }catch(e){
    return res.status(502).json({ok:false,upstream_status:0});
  }
};
