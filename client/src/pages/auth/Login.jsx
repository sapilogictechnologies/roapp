import React,{useState}from'react';
import{useNavigate,Link}from'react-router-dom';
import{useDispatch}from'react-redux';
import toast from'react-hot-toast';
import{setCredentials}from'../../features/auth/authSlice';

const API_BASE=import.meta.env.VITE_API_BASE_URL||'http://localhost:5000/api';

export default function Login(){
  const[form,setForm]=useState({email:'',password:''});
  const[loading,setLoading]=useState(false);
  const[error,setError]=useState('');
  const[show,setShow]=useState(false);
  const dispatch=useDispatch();const navigate=useNavigate();
  const submit=async(e)=>{
    e.preventDefault();setError('');setLoading(true);
    try{
      const res=await fetch(`${API_BASE}/auth/login`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)});
      const data=await res.json();
      if(!res.ok||!data.success){setError(data.message||'Login failed');setLoading(false);return;}
      dispatch(setCredentials({token:data.token,user:data.user}));
      toast.success(`Welcome back, ${data.user.name}!`);
      navigate(data.user.role==='admin'||data.user.role==='staff'?'/admin/dashboard':'/customer/dashboard',{replace:true});
    }catch{setError('Network error.');}
    setLoading(false);
  };
  return(
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm animate-slide-up">
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background:'linear-gradient(135deg,#1e3a5f,#2563eb)'}}><svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white"><path d="M12 2C10 5 5 10 5 15a7 7 0 0014 0c0-5-5-10-7-13z"/></svg></div>
          </Link>
          <h1 className="font-bold text-2xl text-slate-800 mb-1">Welcome back</h1>
          <p className="text-slate-500 text-sm">Sign in to your AquaFlow account</p>
        </div>
        <div className="card shadow-md">
          {error&&<div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm mb-4 bg-red-50 border border-red-200 text-red-700"><svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>{error}</div>}
          <form onSubmit={submit} className="space-y-4">
            <div><label className="label">Email Address</label><div className="relative"><svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg><input className="input pl-10" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="admin@roapp.com" required autoFocus/></div></div>
            <div><label className="label">Password</label><div className="relative"><svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg><input className="input pl-10 pr-10" type={show?'text':'password'} value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="••••••••" required/><button type="button" onClick={()=>setShow(!show)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg></button></div></div>
            <button className="w-full btn-primary py-3 justify-center" type="submit" disabled={loading}>{loading?'Signing in…':'Sign In →'}</button>
          </form>
          <p className="text-center text-sm text-slate-500 mt-4">No account? <Link to="/register" className="text-blue-600 font-semibold hover:text-blue-700">Create one →</Link></p>
          <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Demo Credentials</p>
            <div className="space-y-1 text-xs text-slate-500 font-mono">
              <div className="flex justify-between"><span className="text-slate-400">Admin</span><span>admin@roapp.com / Admin@12345</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Customer</span><span>customer@test.com / Customer@123</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
