import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Product {
  id: number;
  name: string;
}

interface Distributor {
  id: number;
  name: string;
}

interface Franchise {
  id: number;
  name: string;
}

interface AddProductProps {
  onClose: () => void;
}

const AddProduct: React.FC<AddProductProps> = ({ onClose }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(0);
  const [status, setStatus] = useState("Active");
  const [distributorId, setDistributorId] = useState(1); // Example default
  const [franchiseId, setFranchiseId] = useState(1); // Example default
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [franchises, setFranchises] = useState<Franchise[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const response = await fetch(
        "https://sales.baliyoventures.com/api/sales/all-products/"
      );
      const data = await response.json();
      setProducts(data.results);
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchDistributors = async () => {
      const response = await fetch(
        "https://sales.baliyoventures.com/api/account/distributors/"
      );
      const data = await response.json();
      setDistributors(data);
    };

    fetchDistributors();
  }, []);

  useEffect(() => {
    const fetchFranchises = async () => {
      if (distributorId) {
        const response = await fetch(
          `https://sales.baliyoventures.com/api/account/distributors/${distributorId}/franchises/`
        );
        const data = await response.json();
        setFranchises(data);
      }
    };

    fetchFranchises();
  }, [distributorId]);

  const handleSubmit = async () => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      console.error("No access token found");
      return;
    }

    try {
      const response = await fetch(
        "https://sales.baliyoventures.com/api/sales/inventory/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            product: selectedProduct,
            quantity,
            status,
            distributor_id: distributorId,
            franchise_id: franchiseId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add product");
      }

      // Handle success (e.g., notify user, refresh inventory)
      onClose(); // Close the dialog
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Add Product</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
        </DialogHeader>
        <div>
          <select
            onChange={(e) =>
              setSelectedProduct(parseInt(e.target.value) || null)
            }
            value={selectedProduct || ""}
          >
            <option value="">Select Product</option>
            {products.map((product: Product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
          <Input
            type="number"
            placeholder="Quantity"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
          />
          <Input
            placeholder="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          />
          <select
            onChange={(e) => setDistributorId(parseInt(e.target.value) || 1)}
            value={distributorId}
          >
            <option value="">Select Distributor</option>
            {distributors.map((distributor) => (
              <option key={distributor.id} value={distributor.id}>
                {distributor.name}
              </option>
            ))}
          </select>
          <select
            onChange={(e) => setFranchiseId(parseInt(e.target.value) || 1)}
            value={franchiseId}
          >
            <option value="">Select Franchise</option>
            {franchises.map((franchise) => (
              <option key={franchise.id} value={franchise.id}>
                {franchise.name}
              </option>
            ))}
          </select>
          <Button onClick={handleSubmit}>Submit</Button>
          <Button onClick={onClose}>Cancel</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddProduct;
