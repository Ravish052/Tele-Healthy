import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import HomeIndex from './pages/Home/HomeIndex';
import Hero from './pages/Home/Hero';

//Authentication Section
import NewUser from './pages/Auth/login/newUser.jsx';
import Login from './pages/Auth/login/login.jsx'
import VerifyAcct from './pages/Auth/login/VerifyAcct';

// Dashboard
import Dashboard from './pages/Dashboard/Dashboard';
import VideoStream from './components/VideoStream';

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomeIndex />,
    children: [{ index: true, element: <Hero /> }],
  },

  { path: "signup", element: <NewUser /> },
  { path: "login", element: <Login /> },
  { path: "forgotPass", element: <ForgotPass /> },
  { path: "verifyAcct", element: <VerifyAcct /> },

  {
    element: <StreamLayout />,
    children: [
      { path: "dashboard", element: <Dashboard /> },
      { path: "videoCall", element: <VideoStream /> },
    ],
  },
]);

function App() {
  return (
    <div className='border border-red-700 w-full min-w-[100vw] min-h-[100vh]'>
      <RouterProvider router={router} />
    </div>
  )
}

export default App;