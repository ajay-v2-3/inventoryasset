import { useState } from "react";
import { Navigate } from "react-router-dom";

// Legacy login page — redirects to staff login
export default function Login() {
  return <Navigate to="/login" replace />;
}
