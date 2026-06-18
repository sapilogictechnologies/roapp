import React,{useState}from'react';
import{useGetMyJarsQuery,useGetPublicSettingsQuery,useRequestJarReturnMutation}from'../../services/api';
import toast from'react-hot-toast';

export default function JarStatus(){
  const{data,isLoading,refetch}=useGetMyJarsQuery();
  const{data:settings}=useGetPublicSettingsQuery();
  const[requestReturn,{isLoading:returning}]=useRequestJarReturnMutation();
  const[returnQty,setReturnQty]=useState(1);
  const[returnNotes,setReturnNotes]=useState('');
  const[showModal,setShowModal]=useState(false);

  const s=data?.summary||{delivered:0,returned:0,lost:0,balance:0,depositHeld:0};
  const depositPerJar=Number(settings?.jarDepositAmount||150);
  const estimatedDeposit=s.depositHeld??(s.balance*depositPerJar);

  const handleReturn=async()=>{
    if(returnQty>s.balance){toast.error(`Only ${s.balance} jar(s) to return`);return;}
    try{
      const res=await requestReturn({quantity:returnQty,notes:returnNotes||undefined}).unwrap();
      toast.success(res.message||`₹${res.depositRefunded} added to your wallet!`);
      setShowModal(false);setReturnQty(1);setReturnNotes('');refetch();
    }catch(err){toast.error(err?.data?.message||'Return failed');}
  };

  return(
    <div className="app-page max-w-3xl">
      <div className="page-heading">
        <div><h1>Jar Status</h1><p>Track your jar deposits and returns.</p></div>
        {s.balance>0&&(
          <button onClick={()=>setShowModal(true)} className="btn-primary btn-sm">
            ♻️ Return Jars & Get Refund
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {l:'Delivered',v:s.delivered,i:'📦',c:'#14b8a6'},
          {l:'Returned',v:s.returned,i:'♻️',c:'#10b981'},
          {l:'Pending Return',v:s.balance,i:'⏳',c:'#f59e0b'},
          {l:'Deposit Held',v:`₹${estimatedDeposit}`,i:'💰',c:'#8b5cf6'},
        ].map(st=>(
          <div key={st.l} className="card p-4 sm:p-5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl mb-2" style={{background:`${st.c}15`}}>{st.i}</div>
            <p className="font-display font-bold text-xl text-slate-800" style={{color:st.c}}>{st.v}</p>
            <p className="text-xs text-slate-600 mt-0.5">{st.l}</p>
          </div>
        ))}
      </div>

      {/* Return CTA banner */}
      {s.balance>0&&(
        <div className="card p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4" style={{background:'rgba(245,158,11,0.08)',border:'1px solid rgba(245,158,11,0.25)'}}>
          <div className="text-3xl">🫙</div>
          <div className="flex-1">
            <p className="font-display font-semibold text-slate-800">You have {s.balance} jar(s) to return</p>
            <p className="text-sm text-slate-400 mt-0.5">Get ₹{estimatedDeposit} deposited to your wallet. Schedule a return via your next delivery or request now.</p>
          </div>
          <button onClick={()=>setShowModal(true)} className="btn-primary shrink-0">Return & Get Refund ₹{estimatedDeposit}</button>
        </div>
      )}

      {/* How it works */}
      <div className="card">
        <h2 className="font-display font-semibold text-slate-800 mb-4">How Jar Returns Work</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            {n:'1',i:'📦',t:'Jar Delivered',d:'Jar delivered with ₹150 deposit added to your order.'},
            {n:'2',i:'🔄',t:'Request Return',d:'Click "Return Jars" when you\'re ready. We\'ll collect on next delivery.'},
            {n:'3',i:'💰',t:'Get Deposit Back',d:'₹150 per jar instantly credited to your AquaFlow wallet.'},
          ].map(s=>(
            <div key={s.n} className="flex gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black text-blue-600 shrink-0" style={{background:'rgba(20,184,166,0.12)'}}>{s.n}</div>
              <div><p className="font-semibold text-slate-800 text-sm">{s.t}</p><p className="text-xs text-slate-600 mt-0.5">{s.d}</p></div>
            </div>
          ))}
        </div>
      </div>

      {/* Ledger */}
      <div className="card overflow-hidden p-0">
        <div className="px-5 py-4 border-b" style={{borderColor:'rgba(0,0,0,0.08)'}}>
          <h2 className="font-display font-semibold text-slate-800">Transaction History</h2>
        </div>
        {isLoading?(
          <div className="p-5 space-y-2">{[1,2,3].map(i=><div key={i} className="skeleton h-12 rounded-xl"/>)}</div>
        ):!data?.ledger?.length?(
          <div className="py-12 text-center"><div className="text-4xl mb-2">📦</div><p className="text-slate-500 text-sm">No jar records yet</p></div>
        ):(
          <div className="overflow-x-auto">
            <table className="table-auto w-full">
              <thead><tr><th>Date</th><th>Type</th><th>Qty</th><th>Deposit</th><th>Notes</th></tr></thead>
              <tbody>
                {data.ledger.map(e=>(
                  <tr key={e._id}>
                    <td className="text-slate-400">{new Date(e.createdAt).toLocaleDateString('en-IN')}</td>
                    <td><span className={`badge ${e.type==='delivered'?'badge-blue':e.type==='returned'?'badge-green':e.type==='lost'?'badge-red':'badge-yellow'}`}>{e.type}</span></td>
                    <td className="font-medium text-slate-800">{e.quantity}</td>
                    <td className={e.type==='returned'?'text-emerald-400 font-semibold':'text-slate-300'}>{e.depositAmount>0?(e.type==='returned'?'+':'')+'₹'+e.depositAmount:'—'}</td>
                    <td className="text-slate-500">{e.notes||'—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Return modal */}
      {showModal&&(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:'rgba(0,0,0,0.6)',backdropFilter:'blur(6px)'}}>
          <div className="w-full max-w-sm rounded-3xl p-6 animate-scale-in" style={{background:'#ffffff',border:'1px solid var(--border-subtle)',boxShadow:'0 24px 80px rgba(0,0,0,0.6)'}}>
            <h3 className="font-display font-bold text-xl text-slate-800 mb-1">Return Jars</h3>
            <p className="text-sm text-slate-400 mb-5">You have <b className="text-slate-800">{s.balance}</b> jar(s) to return. Deposit will be credited to your wallet.</p>

            <div className="mb-4">
              <label className="label">Number of jars to return</label>
              <div className="flex items-center gap-3 mt-1">
                <div className="flex items-center rounded-xl overflow-hidden" style={{background:'#f1f5f9',border:'1px solid var(--border-subtle)'}}>
                  <button onClick={()=>setReturnQty(q=>Math.max(1,q-1))} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-blue-600 font-black transition-colors">−</button>
                  <span className="w-10 text-center font-bold text-slate-800">{returnQty}</span>
                  <button onClick={()=>setReturnQty(q=>Math.min(s.balance,q+1))} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-blue-600 font-black transition-colors">+</button>
                </div>
                <div className="text-sm text-slate-300">of {s.balance} available</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl mb-4" style={{background:'rgba(20,184,166,0.08)',border:'1px solid rgba(20,184,166,0.2)'}}>
              <div className="flex justify-between text-sm mb-1"><span className="text-slate-400">Jars returning</span><span className="text-slate-800 font-medium">{returnQty}</span></div>
              <div className="flex justify-between text-sm"><span className="text-blue-600 font-semibold">Wallet Credit</span><span className="font-display font-bold text-xl text-blue-600">₹{returnQty*depositPerJar}</span></div>
            </div>

            <div className="mb-4"><label className="label">Notes (optional)</label><input className="input text-sm" placeholder="e.g. Handing to delivery person tomorrow" value={returnNotes} onChange={e=>setReturnNotes(e.target.value)}/></div>

            <div className="text-xs text-slate-500 mb-4 p-3 rounded-xl" style={{background:'#f1f5f9'}}>ℹ️ Our team will collect the jar on your next delivery. Credit will be processed immediately.</div>

            <div className="flex gap-3">
              <button onClick={()=>setShowModal(false)} className="flex-1 btn-secondary py-3 justify-center">Cancel</button>
              <button onClick={handleReturn} disabled={returning} className="flex-1 btn-primary py-3 justify-center">
                {returning?'Processing…':`Get ₹${returnQty*depositPerJar} Back`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
