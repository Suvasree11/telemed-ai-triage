import React,{useState} from 'react';
import axios from 'axios';

function App(){
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [token,setToken]=useState("");
  const [data,setData]=useState([]);

  const login=async()=>{
    const res=await axios.post('http://localhost:5000/api/auth/login',{email,password});
    setToken(res.data.token);
  }

  const fetchData=async()=>{
    const res=await axios.get('http://localhost:5000/api/questions',{
      headers:{Authorization:'Bearer '+token}
    });
    setData(res.data);
  }

  return(
    <div>
      {!token && <div>
        <h3>Admin Login</h3>
        <input placeholder="Email" onChange={e=>setEmail(e.target.value)}/>
        <input placeholder="Password" type="password" onChange={e=>setPassword(e.target.value)}/>
        <button onClick={login}>Login</button>
      </div>}

      {token && <div>
        <h3>Dashboard</h3>
        <button onClick={fetchData}>Load Queries</button>
        <ul>
          {data.map(d=>(
            <li key={d._id}>{d.symptoms} - {d.recommendation}</li>
          ))}
        </ul>
      </div>}
    </div>
  )
}
export default App;