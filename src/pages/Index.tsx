
import { Navigate } from "react-router-dom";

const Index = () => {
  // Redirects to Dashboard (protected by auth)
  return <Navigate to="/" replace />;
};

export default Index;
