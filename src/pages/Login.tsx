import { AuthLayout } from "@/components/auth/AuthLayout";
import { LoginForm } from "@/components/auth/LoginForm";

const Login = () => {
  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Make better decisions, one choice at a time"
    >
      <LoginForm />
    </AuthLayout>
  );
};

export default Login;
