import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { verifyToken } from "./features/AuthSlice";

export default function AuthLoader({ children }) {

  const dispatch = useDispatch();

  useEffect(() => {

    const token = localStorage.getItem("token");

    if (token) {
      dispatch(verifyToken());
    }

  }, [dispatch]);

  return children;
}
