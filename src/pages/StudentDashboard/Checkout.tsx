import React, { useState, useEffect, useContext, FC } from "react";
import {
  loadStripe,
  StripeElementsOptions,
  Appearance,
} from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import axios from "axios";
import CheckoutForm from "./CheckoutForm";
import { AuthContext } from "services";
import { AppContext } from "hooks/appointmentContext";
import { Spinner } from "@chakra-ui/spinner";
const stripePromise = loadStripe(
  "pk_test_51K4FivSGS4s5bT6hJrc9mB6eZsebzyqfh5NnUNOK2g18wUL7PQk0K7urcxAGmVyvIACPk2NDsC3Ykfwkl9mGEFwF00Q0w3xDMk"
);

const Checkout: FC = () => {
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const { auth } = useContext(AuthContext);
  const { state } = useContext(AppContext);
  useEffect(() => {
    setLoading(true);
    axios
      .post(
        "/appointment/create-payment-intent",
        {
          items: [{ id: "appointment" }],
          receipt_email: auth.userData?.email,
        },
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      )
      .then(({ data }) => {
        console.log("metaData", data.metadata);
        setClientSecret(data.clientSecret);
      })
      .finally(() => setLoading(false));
  }, []);

  const appearance: Appearance = {
    theme: "stripe",
  };
  const options: StripeElementsOptions = {
    clientSecret,
    appearance,
  };

  return (
    <div>
      {loading ? (
        <Spinner />
      ) : (
        clientSecret && (
          <Elements options={options} stripe={stripePromise}>
            <CheckoutForm />
          </Elements>
        )
      )}
    </div>
  );
};

export default Checkout;