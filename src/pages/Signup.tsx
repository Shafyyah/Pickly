import { AuthLayout } from "@/components/auth/AuthLayout";
import { SignupForm } from "@/components/auth/SignupForm";

const Signup = () => {
  return (
    <AuthLayout
      title="Get Started"
      subtitle="Make better decisions, one choice at a time"
    >
      <SignupForm />
    </AuthLayout>
  );
};

export default Signup;
