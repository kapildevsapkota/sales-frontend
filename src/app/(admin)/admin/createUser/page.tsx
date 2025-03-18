import CreateAccountForm from "@/components/createUser/page";
import { Toaster } from "sonner";

export default function CreateAccountPage() {
  return (
    <div className="container py-10">
      <CreateAccountForm />
      <Toaster richColors closeButton />
    </div>
  );
}
