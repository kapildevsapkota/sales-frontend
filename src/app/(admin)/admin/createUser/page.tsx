import CreateAccountForm from "@/components/createUser/page";
import { Toaster } from "sonner";

export default function CreateAccountPage() {
  return (
    <div className="container py-10 mx-auto px-2 md:px-4">
      <CreateAccountForm />
      <Toaster richColors closeButton />
    </div>
  );
}
