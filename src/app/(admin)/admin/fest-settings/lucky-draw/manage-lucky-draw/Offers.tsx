import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Trash2, Gift, Plus, X, Check } from "lucide-react";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";

interface RawOfferItemGift {
  id: number;
  name: string;
  image: string;
  category: string;
  lucky_draw_system: number;
}

interface RawOffer {
  id: number;
  gift: RawOfferItemGift[];
  start_date: string;
  end_date: string;
  start_time?: string;
  end_time?: string;
  has_time_limit?: boolean;
  daily_quantity: number;
  type_of_offer: string;
  offer_condition_value: string;
  sale_numbers: number[] | null;
  has_region_limit?: boolean;
  lucky_draw_system: number;
  valid_condition: number[];
}

interface ApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: RawOffer[];
}

interface GiftItem {
  id: number;
  name: string;
  image: string;
  category: string;
  lucky_draw_system: number;
}

interface OffersProps {
  luckyDrawId: number;
}

const offerSchema = z.object({
  type: z.enum(["offer"]),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
  daily_quantity: z.number().min(1, "Daily quantity must be at least 1"),
  type_of_offer: z.enum([
    "After every certain sale",
    "At certain sale position",
  ]),
  offer_condition_value: z.string().min(1, "Offer condition value is required"),
  gift: z.array(z.number()).optional(),
  amount: z.number().optional(),
  provider: z.string().optional(),
});

type OfferFormData = z.infer<typeof offerSchema>;

// Custom Multi-Select Component
interface MultiSelectProps {
  options: GiftItem[];
  value: number[];
  onChange: (value: number[]) => void;
  placeholder?: string;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select gifts",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleOption = (optionId: number) => {
    if (value.includes(optionId)) {
      onChange(value.filter((id) => id !== optionId));
    } else {
      // Find the option being selected
      const selectedOption = options.find((option) => option.id === optionId);
      if (!selectedOption) return;

      // Check if there's already an item from the same category selected
      const existingItemFromCategory = value.find((id) => {
        const existingOption = options.find((option) => option.id === id);
        return (
          existingOption && existingOption.category === selectedOption.category
        );
      });

      if (existingItemFromCategory) {
        // Replace the existing item from the same category
        onChange([
          ...value.filter((id) => id !== existingItemFromCategory),
          optionId,
        ]);
      } else {
        // Add the new item
        onChange([...value, optionId]);
      }
    }
  };

  const removeOption = (optionId: number) => {
    onChange(value.filter((id) => id !== optionId));
  };

  const selectedOptions = options.filter((option) => value.includes(option.id));

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className="flex min-h-[40px] w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex flex-wrap gap-1">
          {selectedOptions.length > 0 ? (
            selectedOptions.map((option) => (
              <Badge
                key={option.id}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {option.name} ({option.category})
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeOption(option.id);
                  }}
                />
              </Badge>
            ))
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </div>
      </div>
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-input rounded-md shadow-lg max-h-60 overflow-auto">
          {options.length > 1 && (
            <div
              className="flex items-center justify-between px-3 py-2 hover:bg-gray-100 cursor-pointer border-b"
              onClick={() => {
                // Get unique categories
                const categories = Array.from(
                  new Set(options.map((option) => option.category))
                );

                if (value.length === categories.length) {
                  onChange([]);
                } else {
                  // Select first item from each category
                  const firstFromEachCategory = categories
                    .map((category) => {
                      return options.find(
                        (option) => option.category === category
                      )?.id;
                    })
                    .filter(Boolean) as number[];

                  onChange(firstFromEachCategory);
                }
              }}
            >
              <span className="font-medium">
                {value.length ===
                Array.from(new Set(options.map((option) => option.category)))
                  .length
                  ? "Deselect All"
                  : "Select One Per Category"}
              </span>
              {value.length ===
                Array.from(new Set(options.map((option) => option.category)))
                  .length && <Check className="h-4 w-4 text-green-600" />}
            </div>
          )}
          {options.map((option) => {
            const isSelected = value.includes(option.id);
            const hasCategoryConflict =
              !isSelected &&
              value.some((id) => {
                const existingOption = options.find((opt) => opt.id === id);
                return (
                  existingOption && existingOption.category === option.category
                );
              });

            return (
              <div
                key={option.id}
                className={`flex items-center justify-between px-3 py-2 cursor-pointer ${
                  isSelected
                    ? "bg-green-50 hover:bg-green-100"
                    : hasCategoryConflict
                    ? "bg-yellow-50 hover:bg-yellow-100"
                    : "hover:bg-gray-100"
                }`}
                onClick={() => toggleOption(option.id)}
              >
                <span className={hasCategoryConflict ? "text-yellow-700" : ""}>
                  {option.name} ({option.category})
                  {hasCategoryConflict && (
                    <span className="text-xs text-yellow-600 ml-1">
                      (will replace existing {option.category})
                    </span>
                  )}
                </span>
                {isSelected && <Check className="h-4 w-4 text-green-600" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const Offers: React.FC<OffersProps> = ({ luckyDrawId }) => {
  const [offers, setOffers] = useState<RawOffer[]>([]);
  const [giftItems, setGiftItems] = useState<GiftItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingOffer, setIsAddingOffer] = useState(false);
  const [totalOffers, setTotalOffers] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<OfferFormData>({
    resolver: zodResolver(offerSchema),
    defaultValues: {
      type: "offer",
      type_of_offer: "After every certain sale",
    },
  });

  const typeOfOffer = watch("type_of_offer");
  const dailyQuantity = watch("daily_quantity");

  useEffect(() => {
    fetchOffers();
    fetchGiftItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [luckyDrawId]);

  const fetchOffers = async () => {
    setIsLoading(true);
    try {
      const [electronicOffers] = await Promise.all([
        fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/offers/?lucky_draw_system_id=${luckyDrawId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        ).then((res) => res.json()) as Promise<ApiResponse>,
      ]);

      // Normalize API response to only required fields and set a concrete type
      // Support both array response and paginated { results, count } response
      const rawList: RawOffer[] = Array.isArray(
        electronicOffers as unknown as RawOffer[]
      )
        ? (electronicOffers as unknown as RawOffer[])
        : (electronicOffers.results as RawOffer[]);

      const normalizedOffers: RawOffer[] = rawList.map((o) => ({
        id: o.id,
        start_date: o.start_date,
        end_date: o.end_date,
        daily_quantity: o.daily_quantity,
        type_of_offer: o.type_of_offer,
        offer_condition_value: o.offer_condition_value,
        sale_numbers: o.sale_numbers,
        gift: (o.gift || []).map((g) => ({
          id: g.id,
          name: g.name,
          image: g.image,
          category: g.category,
          lucky_draw_system: g.lucky_draw_system,
        })),
        valid_condition: o.valid_condition || [],
        lucky_draw_system: o.lucky_draw_system,
      }));

      setOffers(normalizedOffers);
      setTotalOffers(
        Array.isArray(electronicOffers as unknown as RawOffer[])
          ? normalizedOffers.length
          : electronicOffers.count
      );
    } catch (error) {
      console.error("Error fetching offers:", error);
      toast({
        title: "Error",
        description: "Failed to fetch offers",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGiftItems = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/gift-items/?lucky_draw_system_id=${luckyDrawId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      const data = await response.json();
      setGiftItems(data);
    } catch (error) {
      console.error("Error fetching gift items:", error);
      toast({
        title: "Error",
        description: "Failed to fetch gift items",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: OfferFormData) => {
    setIsAddingOffer(true);
    try {
      const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/offers/`;

      const offerData = {
        ...data,
        lucky_draw_system: luckyDrawId,
        sale_numbers:
          data.type_of_offer === "At certain sale position"
            ? data.offer_condition_value.split(",").map(Number)
            : null,
        priority: 0,
      };

      // check if sales numbers are valid for the offer i.e should be equal to daily quantity and should be unique numbers

      if (offerData.type_of_offer === "At certain sale position") {
        const salesNumbers = offerData.offer_condition_value
          .split(",")
          .map(Number);
        if (salesNumbers.length !== offerData.daily_quantity) {
          alert("Number of sales numbers should be equal to daily quantity");
        }
        if (new Set(salesNumbers).size !== salesNumbers.length) {
          alert("Sales numbers should be unique numbers");
        }
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify(offerData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add offer");
      }

      await response.json();
      await fetchOffers();
      toast({
        title: "Success",
        description: "Offer added successfully",
      });
      reset();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error adding offer:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to add offer",
        variant: "destructive",
      });
    } finally {
      setIsAddingOffer(false);
    }
  };

  const handleDeleteOffer = async (id: number) => {
    try {
      const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/offers/${id}/`;

      const response = await fetch(endpoint, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete offer");
      }

      setOffers(offers.filter((offer) => offer.id !== id));
      setTotalOffers(totalOffers - 1);
      toast({
        title: "Success",
        description: "Offer deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting offer:", error);
      toast({
        title: "Error",
        description: "Failed to delete offer",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div>Loading offers...</div>;
  }

  return (
    <Card className="w-full shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between bg-gray-50 p-6 border-b">
        <CardTitle className="text-2xl font-bold text-gray-800">
          All Offers
        </CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-teal-600 hover:bg-teal-700 text-white">
              <Plus className="mr-2 h-4 w-4" /> Add New Offer
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-white">
            <DialogHeader>
              <DialogTitle>Add New Offer</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select offer type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="offer">Offer</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {
                <Controller
                  name="gift"
                  control={control}
                  render={({ field }) => (
                    <MultiSelect
                      options={giftItems}
                      value={field.value || []}
                      onChange={field.onChange}
                      placeholder="Select gifts"
                    />
                  )}
                />
              }
              <Controller
                name="start_date"
                control={control}
                render={({ field }) => (
                  <Input type="date" placeholder="Start Date" {...field} />
                )}
              />
              {errors.start_date && (
                <p className="text-red-500">{errors.start_date.message}</p>
              )}
              <Controller
                name="end_date"
                control={control}
                render={({ field }) => (
                  <Input type="date" placeholder="End Date" {...field} />
                )}
              />
              {errors.end_date && (
                <p className="text-red-500">{errors.end_date.message}</p>
              )}
              <Controller
                name="daily_quantity"
                control={control}
                render={({ field }) => (
                  <Input
                    type="number"
                    placeholder="Daily Quantity"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                )}
              />
              {errors.daily_quantity && (
                <p className="text-red-500">{errors.daily_quantity.message}</p>
              )}
              <Controller
                name="type_of_offer"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select offer condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="After every certain sale">
                        After every certain sale
                      </SelectItem>
                      <SelectItem value="At certain sale position">
                        At certain sale position
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {typeOfOffer === "After every certain sale" && (
                <p className="text-sm text-gray-500">
                  Enter a number to specify after how many sales the offer
                  should be given.
                </p>
              )}
              <Controller
                name="offer_condition_value"
                control={control}
                render={({ field }) => (
                  <Input
                    placeholder={
                      typeOfOffer === "After every certain sale"
                        ? "Enter a number"
                        : `Enter ${dailyQuantity} numbers separated by commas`
                    }
                    {...field}
                  />
                )}
              />
              {errors.offer_condition_value && (
                <p className="text-red-500">
                  {errors.offer_condition_value.message}
                </p>
              )}
              {typeOfOffer === "After every certain sale" && (
                <p className="text-sm text-gray-500">
                  Your offer will be <br />
                  {(() => {
                    const values = Array.from(
                      { length: dailyQuantity },
                      (_, i) => i + 1
                    ).map(
                      (num) => num * parseInt(watch("offer_condition_value"))
                    );

                    if (values.length > 5) {
                      return [
                        ...values.slice(0, 3),
                        "...",
                        ...values.slice(-2),
                      ].join(", ");
                    } else {
                      return values.join(", ");
                    }
                  })()}
                </p>
              )}
              {typeOfOffer === "At certain sale position" && (
                <p className="text-sm text-gray-500">
                  Enter {dailyQuantity} numbers separated by commas to specify
                  the exact sale positions for the offer.
                </p>
              )}

              {/* Amount/provider fields removed */}
              <Button
                type="submit"
                className="w-full bg-teal-600 hover:bg-teal-700"
                disabled={isAddingOffer}
              >
                <Gift className="mr-2 h-4 w-4" />
                {isAddingOffer ? "Adding..." : "Add Offer"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="p-6">
        {offers.length === 0 ? (
          <div className="text-center py-4">No offers available</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-100">
                <TableHead className="font-semibold">Type</TableHead>
                <TableHead className="font-semibold">Date Range</TableHead>
                <TableHead className="font-semibold">Daily Quantity</TableHead>
                <TableHead className="font-semibold">Offer Condition</TableHead>
                <TableHead className="font-semibold">Gift/Amount</TableHead>
                <TableHead className="font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {offers.map((offer) => (
                <TableRow key={offer.id} className="hover:bg-gray-50">
                  <TableCell>Offer</TableCell>
                  <TableCell>
                    {`${format(
                      new Date(offer.start_date),
                      "MMM dd, yyyy"
                    )} - ${format(new Date(offer.end_date), "MMM dd, yyyy")}`}
                  </TableCell>
                  <TableCell>{offer.daily_quantity}</TableCell>
                  <TableCell>
                    {`${offer.type_of_offer}: ${
                      offer.type_of_offer === "At certain sale position"
                        ? offer.sale_numbers?.join(", ") || "N/A"
                        : offer.offer_condition_value
                    }`}
                  </TableCell>
                  <TableCell>
                    {Array.isArray(offer.gift)
                      ? offer.gift.map((gift, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="mr-1"
                          >
                            {gift.name} ({gift.category})
                          </Badge>
                        ))
                      : null}
                  </TableCell>
                  <TableCell>
                    <Button
                      onClick={() => handleDeleteOffer(offer.id)}
                      size="sm"
                      variant="ghost"
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default Offers;
