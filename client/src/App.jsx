import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Register from "./components/Register";
import Login from "./components/Login";
import Logout from "./components/Logout";
import Reset from "./components/Reset";
import ForgotPassword from "./components/ForgotPassword";

const App = () => {
  return (
    <>
      <Register />
      <Login />
      <Reset />
      <ForgotPassword />
      <Logout />
      <ToastContainer />
    </>
  );
};

export default App;
