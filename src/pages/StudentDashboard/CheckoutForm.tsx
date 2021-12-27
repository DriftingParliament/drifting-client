import React, { useEffect, useState, FC, useContext } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import {
  PaymentIntentResult,
  StripeError,
  PaymentIntent,
} from "@stripe/stripe-js";
import { Box } from "@chakra-ui/layout";
import { Button } from "@chakra-ui/button";
import { Spinner } from "@chakra-ui/spinner";
import { GiWallet } from "react-icons/gi";
import { toast } from "react-toastify";
import { AppContext } from "hooks/appointmentContext";
import axios from "axios";
import { AppointmentType } from "hooks/appointmentReducer";

const toastID = "Payment Page";
const CheckoutForm: FC = () => {
  const stripe = useStripe();
  const elements = useElements();

  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { state } = useContext(AppContext);

  const paymentStatus = async (clientSecret: string) => {
    if (!stripe) {
      return;
    }
    const createAppointment = async (
      appointmentData: AppointmentType,
      paymentIntent: PaymentIntent
    ) => {
      const createAppointmentUrl = "/appointment";
      try {
        const createdAppointment = await axios.post(createAppointmentUrl, {
          appointmentData,
          paymentIntent,
        });
        console.log("created", createdAppointment);
      } catch (error) {
        console.log("error", error);
      }
    };
    const {
      paymentIntent,
    }: PaymentIntentResult = await stripe.retrievePaymentIntent(clientSecret);
    switch (paymentIntent?.status) {
      case "succeeded":
        const appointmentData: AppointmentType =
          JSON.parse(localStorage.getItem("newAppointment") || "") || "";
        createAppointment(appointmentData, paymentIntent);
        setMessage("Payment succeeded!");
        break;
      case "processing":
        setMessage("Your payment is processing.");
        break;
      case "requires_payment_method":
        setMessage("Your payment was not successful, please try again.");
        break;
      default:
        setMessage("Something went wrong.");
        break;
    }
  };

  useEffect(() => {
    console.log("state", state.appointments[0]);
    const clientSecret = new URLSearchParams(window.location.search).get(
      "payment_intent_client_secret"
    );

    if (!clientSecret) {
      return;
    }
    paymentStatus(clientSecret);
  }, [stripe]);

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    const { error }: { error: StripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: "http://localhost:3000/studentDashboard/payment-status",
      },
    });
    if (error.type === "card_error" || error.type === "validation_error") {
      setMessage(error?.message || "Yoo Error Here");
    } else {
      setMessage("An unexpected error occured.");
    }

    setIsLoading(false);
  };

  return stripe === null || elements === null ? (
    <Spinner />
  ) : (
    <Box
      display={"flex"}
      justifyContent={"center"}
      minH={"100vh"}
      alignContent={"center"}
    >
      <form
        id="payment-form"
        style={{
          width: "30vw",
          minWidth: "500px",
          alignSelf: "center",
        }}
        onSubmit={handleSubmit}
      >
        {message && toast(message, { toastId: toastID })}
        <PaymentElement id="payment-element" />
        <Box
          display={"flex"}
          justifyContent={"space-around"}
          my="1.5rem"
          p="1rem"
        >
          <Button
            id="cancel"
            px="1.8rem"
            py="1rem"
            disabled={isLoading || !stripe || !elements}
            bg="danger"
            leftIcon={<GiWallet size={"1.25rem"} />}
            mx={2}
          >
            Cancel
          </Button>
          <Button
            id="submit"
            px="1.8rem"
            py="1rem"
            disabled={isLoading || !stripe || !elements}
            isLoading={isLoading}
            loadingText="Proccessing"
            bg="success"
            leftIcon={<GiWallet size={"1.25rem"} />}
            type="submit"
            mx={2}
          >
            Book it !
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default CheckoutForm;
