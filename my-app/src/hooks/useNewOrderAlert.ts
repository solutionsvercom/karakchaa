import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { API_ORDERS } from "../config/Api";
import {
  installAudioUnlockListeners,
  playNewOrderSound,
  subscribeAudioUnlock,
} from "../utils/playNotificationSound";

export const NEW_DIGITAL_ORDER_EVENT = "karakchaa:new-digital-order";

type ActiveOrder = {
  _id: string;
  orderSource?: string;
  orderType?: string;
};

const knownActiveOrderIds = new Set<string>();
let alertInitialized = false;

function isDigitalOrder(order: ActiveOrder): boolean {
  const source = String(order.orderSource || "").toUpperCase();
  const type = String(order.orderType || "").toLowerCase();
  return source === "DIGITAL" || type === "online";
}

function findNewDigitalOrders(orders: ActiveOrder[]): ActiveOrder[] {
  const currentIds = new Set(orders.map((order) => order._id));

  if (!alertInitialized) {
    currentIds.forEach((id) => knownActiveOrderIds.add(id));
    alertInitialized = true;
    return [];
  }

  const newcomers = orders.filter((order) => !knownActiveOrderIds.has(order._id));

  currentIds.forEach((id) => knownActiveOrderIds.add(id));
  Array.from(knownActiveOrderIds).forEach((id) => {
    if (!currentIds.has(id)) knownActiveOrderIds.delete(id);
  });

  return newcomers.filter(isDigitalOrder);
}

async function fetchActiveOrders(): Promise<ActiveOrder[]> {
  const res = await axios.get(API_ORDERS, {
    params: {
      status: "Pending,Accepted,Preparing,Ready",
      limit: 1000,
    },
  });
  return Array.isArray(res.data?.data) ? res.data.data : [];
}

export function useNewOrderAlert() {
  const [audioReady, setAudioReady] = useState(false);
  const [alertToast, setAlertToast] = useState("");
  const toastTimeoutRef = useRef<number | null>(null);
  const pollingRef = useRef(false);

  useEffect(() => {
    const stopUnlock = installAudioUnlockListeners();
    const unsubscribe = subscribeAudioUnlock(setAudioReady);
    return () => {
      stopUnlock();
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const checkForNewOrders = async () => {
      if (pollingRef.current) return;
      pollingRef.current = true;
      try {
        const orders = await fetchActiveOrders();
        const newDigitalOrders = findNewDigitalOrders(orders);
        if (newDigitalOrders.length === 0) return;

        void playNewOrderSound();

        const message =
          newDigitalOrders.length === 1
            ? "New digital order received"
            : `${newDigitalOrders.length} new digital orders received`;
        setAlertToast(message);

        window.dispatchEvent(
          new CustomEvent(NEW_DIGITAL_ORDER_EVENT, {
            detail: { count: newDigitalOrders.length },
          })
        );

        if (toastTimeoutRef.current) {
          window.clearTimeout(toastTimeoutRef.current);
        }
        toastTimeoutRef.current = window.setTimeout(() => {
          setAlertToast("");
        }, 6000);
      } catch {
        // Keep polling; a single failed request should not stop alerts.
      } finally {
        pollingRef.current = false;
      }
    };

    void checkForNewOrders();
    const interval = window.setInterval(checkForNewOrders, 2500);

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        void checkForNewOrders();
      }
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
      if (toastTimeoutRef.current) {
        window.clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  return { audioReady, alertToast, setAlertToast };
}
