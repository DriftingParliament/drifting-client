import { FC, ComponentType, ReactElement, ReactComponentElement } from "react";
import { Route, Redirect, RouteProps } from "react-router-dom";

import { useIsAuthenticated } from "hooks";
import { Center } from "@chakra-ui/layout";
import { Spinner } from "@chakra-ui/spinner";

export type PrivateRouteProps = {
  isAuthenticated: boolean;
} & RouteProps;

const PublicRoute = ({
  children,
  isAuthenticated,
  ...rest
}: PrivateRouteProps) => {
  const { isLoading, data } = useIsAuthenticated();
  console.log("PublicRoute", data);
  const redirectPath =
    data?.role !== undefined &&
    data.role
      .toString()
      .toLowerCase()
      .concat("Dashboard");

  const isAuth = data?.token !== undefined ? true : false;

  return isLoading ? (
    <Center h={"100vh"}>
      <Spinner />
    </Center>
  ) : (
    <Route
      {...rest}
      render={({ location }) =>
        !isAuth ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: `/${redirectPath}`,
              state: { from: location },
            }}
          />
        )
      }
    />
  );
};

export default PublicRoute;
