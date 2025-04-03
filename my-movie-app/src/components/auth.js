// export const refreshToken = () => {
//     fetch(BACKEND_URL + "/api/token/refresh/', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ refresh: localStorage.getItem('refresh') })
//     })
//     .then(res => res.json())
//     .then(data => localStorage.setItem('token', data.access))
//     .catch(() => {
//       localStorage.clear();
//       window.location = '/login';
//     });
//   }
  