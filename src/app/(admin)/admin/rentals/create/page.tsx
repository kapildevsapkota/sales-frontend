import { RentalForm } from "../components/rental-form";

export default function CreateRentalPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Create New Rental</h1>
      </div>

      <RentalForm />
    </div>
  );
}
