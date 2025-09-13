
import Home from './pages/Home.jsx';
import Auth from './pages/Auth.jsx';
export default function App(){
  const hash = location.hash || '#/';
  if(hash.startsWith('#/auth')) return <Auth/>;
  return <Home/>;
}
