// import React, { useState } from 'react';

// export default function Login({ setToken }) {
//     const [username, setUsername] = useState('');
//     const [password, setPassword] = useState('');

//     const handleSubmit = (e) => {
//         e.preventDefault();
//         fetch(BACKEND_URL + '/api/token/', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ username, password }),
//         })
//             .then(res => {
//                 if (!res.ok) throw new Error("Échec de connexion");
//                 return res.json();
//             })
//             .then(data => {
//                 localStorage.setItem('token', data.access);
//                 localStorage.setItem('refresh', data.refresh);
//                 window.location.reload();
//             })
//             .catch(err => alert(err));
//     };

//     return (
//         <form onSubmit={handleSubmit} className="flex flex-col w-80 mx-auto">
//             <input placeholder="Nom d'utilisateur" onChange={e => setUsername(e.target.value)} className="border p-2 rounded mb-2" />
//             <input type="password" placeholder="Mot de passe" onChange={e => setPassword(e.target.value)} className="border p-2 rounded mb-2" />
//             <button className="bg-blue-500 text-white rounded p-2">Se connecter</button>
//         </form>
//     );
// }
