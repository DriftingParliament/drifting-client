import { useContext } from "react";
import { LoginFormInputs } from "atoms/LoginForm";
import axios from "axios";
import { axiosClient } from "services";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useHistory } from "react-router-dom";
import { showToast, showMyToast } from "atoms";
import { useToast } from "@chakra-ui/toast";

export enum UserRole {
  STUDENT,
  TEACHER,
}

export type UserDataType = {
  authStrategy: string;
  email: string;
  id: string;
  isEmailVerified: boolean;
  name: string;
  refreshToken: [{ refreshToken: string }];
  role: UserRole;
  username: string;
};

export type AuthContextType = {
  success: boolean;
  token: string | null;
  userData?: UserDataType | null;
  role: UserRole;
  errorMessage?: string;
  redirectPath?: string;
};

/* Base URL */
const baseURL = "auth";

/* User : Login Authentication */

const login = async (data: LoginFormInputs) => {
  const loginURL = `/${baseURL}/login/`;
  const { email, password } = data;
  const loginResponse = await axiosClient.post(loginURL, {
    username: email,
    password: password,
  });

  return loginResponse.data;
};

const useLogin = () => {
  let history = useHistory();
  let toast = useToast();
  return useMutation(
    "loginAuth",
    (newData: LoginFormInputs) => login(newData),
    {
      onSuccess: (data: AuthContextType) => {
        console.log("dataM", data);
        if (data.success && data.role !== undefined) {
          axios.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${data.token}`;

          const myRole = data.role.toString();
          const redirectPath = myRole.toLowerCase().concat("Dashboard");
          history.replace(`/${redirectPath}`);
        } else {
          if (data.errorMessage !== undefined) {
            console.log("errorM", data);
            showToast(toast, data);
          }
        }
      },
      onError: (error) => {
        if (axios.isAxiosError(error)) {
          console.log("dataMError", error.response?.data.errorMessage);
          showMyToast(toast, "error", error.response?.data.errorMessage);
        }
      },
    }
  );
};

/* USER : Verify User */
const isAuthenticated = async () => {
  const userDataUrl = `${baseURL}/refreshToken`;
  const { data } = await axiosClient.get(userDataUrl);
  /*   console.log("Verify UserData", data); */
  if (data.success) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${data?.token}`;
  }
  return data;
};
const useIsAuthenticated = () => {
  return useQuery<AuthContextType, Error>(
    "getisAuthenticated",
    () => isAuthenticated(),
    {
      keepPreviousData: true,
      staleTime: 1000 * 60 * 5,
      retry: 1,
    }
  );
};
/* USER : Get User MetaData */
const getUserData = async () => {
  const userDataUrl = `${baseURL}/me`;
  const { data, status } = await axiosClient.get(userDataUrl);
  /* console.log("UserData", data); */
  return data;
};
const useUserData = () => {
  //console.log("isTokenAvaliablerq", isTokenAvaliable);
  return useQuery<{ success: boolean; user: UserDataType }>(
    "getUserData",
    () => getUserData(),
    {
      //keepPreviousData: true,
      staleTime: 1000 * 60 * 5,
      //enabled: !!isTokenAvaliable,
    }
  );
};
/* USER : Logout */
const logout = async () => {
  const logoutUrl = `${baseURL}/logout`;

  const { data } = await axiosClient.post(logoutUrl);
  /* console.log("LogoutData", data); */
  return data;
};
const useLogout = () => {
  const queryClient = useQueryClient();
  const history = useHistory();
  return useMutation("logoutAuth", () => logout(), {
    onSuccess: () => {
      /// queryClient.invalidateQueries(["getUserData", "getisAuthenticated"]);
      queryClient.invalidateQueries("getisAuthenticated");
      queryClient.invalidateQueries("getUserData");
      window.localStorage.setItem("logout", JSON.stringify(Date.now()));
      history.go(0);
      //history.replace("/login");
    },
  });
};

export { useLogin, useIsAuthenticated, useUserData, useLogout };
