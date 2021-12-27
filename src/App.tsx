import React from "react";
import "./App.css";
import { ChakraProvider } from "@chakra-ui/react";
import theme from "./styles/theme";
import "@fontsource/poppins/400.css";
import "@fontsource/lato/700.css";
import { PrivateRoute } from "atoms";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import {
  AboutUs,
  Blog,
  Homepage,
  Signup,
  Login,
  StudentDashboard,
  TeacherDashboard,
} from "pages";
import axios from "axios";
import { AuthProvider } from "services/AuthContext";
import Auth from "pages/Auth";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
function App() {
  axios.defaults.baseURL = "http://localhost:5000/v1/";
  axios.defaults.withCredentials = true;

  return (
    <Router>
      <ChakraProvider theme={theme}>
        <AuthProvider>
          <ToastContainer />
          <Switch>
            <Route path="/" exact component={Homepage} />
            <Route path="/aboutus" component={AboutUs} />
            <Route path="/blog" component={Blog} />
            <Route path="/signup" component={Signup} />
            <Route path="/login" component={Login} />
            <Route path="/auth" component={Auth} />

            <PrivateRoute
              path="/studentDashboard"
              component={StudentDashboard}
            />
            <PrivateRoute
              path="/teacherDashboard"
              component={TeacherDashboard}
            />
          </Switch>
        </AuthProvider>
      </ChakraProvider>
    </Router>
  );
}

export default App;
