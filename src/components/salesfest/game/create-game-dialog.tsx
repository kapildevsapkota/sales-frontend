"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Trash2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";
import { createGame } from "@/lib/game-api";
import { toast } from "sonner";
import type { CreateGamePayload } from "@/types/game";

const ruleSchema = z
  .object({
    rule_type: z.enum(["product", "keyword"]),
    product: z.coerce.number().optional().nullable(),
    keyword: z.string().optional().nullable(),
    min_quantity: z.coerce.number().min(1, "Min quantity must be at least 1"),
  })
  .superRefine((data, ctx) => {
    if (data.rule_type === "product" && !data.product) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["product"],
        message: "Product is required",
      });
    }
    if (data.rule_type === "keyword" && !data.keyword?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["keyword"],
        message: "Keyword is required",
      });
    }
  });

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  is_active: z.boolean(),
  conditions: z
    .array(
      z.object({
        description: z.string().min(1, "Condition description is required"),
        is_active: z.boolean(),
        rules: z.array(ruleSchema).min(1, "At least one rule is required"),
      }),
    )
    .min(1, "At least one condition is required"),
});

type FormValues = z.infer<typeof formSchema>;

interface ProductOption {
  id: number;
  name: string;
}

interface CreateGameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const defaultRule = {
  rule_type: "keyword" as const,
  product: null,
  keyword: "",
  min_quantity: 1,
};

const defaultCondition = {
  description: "",
  is_active: true,
  rules: [defaultRule],
};

export function CreateGameDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateGameDialogProps) {
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      is_active: true,
      conditions: [defaultCondition],
    },
  });

  const {
    fields: conditionFields,
    append: appendCondition,
    remove: removeCondition,
  } = useFieldArray({
    control: form.control,
    name: "conditions",
  });

  useEffect(() => {
    if (!open) return;

    async function fetchProducts() {
      setProductsLoading(true);
      try {
        const response = await api.get<
          | Array<{ id: number; name: string }>
          | { results: Array<{ id: number; name: string }> }
        >("/api/sales/all-products/");
        const data = response.data;
        const list = Array.isArray(data) ? data : (data.results ?? []);
        setProducts(list.map((p) => ({ id: p.id, name: p.name })));
      } catch {
        toast.error("Failed to load products");
      } finally {
        setProductsLoading(false);
      }
    }

    fetchProducts();
  }, [open]);

  useEffect(() => {
    if (!open) {
      form.reset({
        name: "",
        description: "",
        is_active: true,
        conditions: [defaultCondition],
      });
    }
  }, [open, form]);

  const handleSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      const payload: CreateGamePayload = {
        name: values.name,
        description: values.description,
        is_active: values.is_active,
        conditions: values.conditions.map((condition) => ({
          description: condition.description,
          is_active: condition.is_active,
          rules: condition.rules.map((rule) => ({
            rule_type: rule.rule_type,
            product: rule.rule_type === "product" ? rule.product : null,
            keyword: rule.rule_type === "keyword" ? rule.keyword?.trim() : null,
            min_quantity: rule.min_quantity,
          })),
        })),
      };

      await createGame(payload);
      toast.success("Game created successfully");
      onOpenChange(false);
      onSuccess();
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail ?? "Failed to create game";
      toast.error(
        typeof message === "string" ? message : "Failed to create game",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Game</DialogTitle>
          <DialogDescription>
            Define challenge conditions and rules. Each condition can have
            multiple product or keyword rules.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="name">Game Name</Label>
              <Input
                id="name"
                {...form.register("name")}
                placeholder="Weekly Combo Challenge"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...form.register("description")}
                placeholder="Place orders matching condition rules to win exciting gifts!"
                rows={2}
              />
              {form.formState.errors.description && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3 sm:col-span-2">
              <div>
                <Label htmlFor="is_active">Active Game</Label>
                <p className="text-xs text-muted-foreground">
                  Only one active game runs at a time
                </p>
              </div>
              <Switch
                id="is_active"
                checked={form.watch("is_active")}
                onCheckedChange={(checked) =>
                  form.setValue("is_active", checked)
                }
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Conditions</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendCondition(defaultCondition)}
              >
                <Plus className="mr-1 h-4 w-4" />
                Add Condition
              </Button>
            </div>

            {conditionFields.map((conditionField, conditionIndex) => (
              <ConditionBlock
                key={conditionField.id}
                conditionIndex={conditionIndex}
                form={form}
                products={products}
                productsLoading={productsLoading}
                canRemove={conditionFields.length > 1}
                onRemove={() => removeCondition(conditionIndex)}
              />
            ))}

            {form.formState.errors.conditions?.message && (
              <p className="text-sm text-destructive">
                {form.formState.errors.conditions.message}
              </p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Game
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface ConditionBlockProps {
  conditionIndex: number;
  form: ReturnType<typeof useForm<FormValues>>;
  products: ProductOption[];
  productsLoading: boolean;
  canRemove: boolean;
  onRemove: () => void;
}

function ConditionBlock({
  conditionIndex,
  form,
  products,
  productsLoading,
  canRemove,
  onRemove,
}: ConditionBlockProps) {
  const {
    fields: ruleFields,
    append: appendRule,
    remove: removeRule,
  } = useFieldArray({
    control: form.control,
    name: `conditions.${conditionIndex}.rules`,
  });

  return (
    <div className="rounded-lg border bg-muted/30 p-4 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <Label>Condition {conditionIndex + 1}</Label>
          <Input
            {...form.register(`conditions.${conditionIndex}.description`)}
            placeholder="Sachet Oil + Shampoo Bottle challenge"
          />
          {form.formState.errors.conditions?.[conditionIndex]?.description && (
            <p className="text-sm text-destructive">
              {
                form.formState.errors.conditions[conditionIndex]?.description
                  ?.message
              }
            </p>
          )}
        </div>
        {canRemove && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="mt-6 shrink-0 text-destructive hover:text-destructive"
            onClick={onRemove}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Switch
            checked={form.watch(`conditions.${conditionIndex}.is_active`)}
            onCheckedChange={(checked) =>
              form.setValue(`conditions.${conditionIndex}.is_active`, checked)
            }
          />
          <span className="text-sm text-muted-foreground">Active</span>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => appendRule(defaultRule)}
        >
          <Plus className="mr-1 h-3.5 w-3.5" />
          Add Rule
        </Button>
      </div>

      <div className="space-y-3">
        {ruleFields.map((ruleField, ruleIndex) => {
          const ruleType = form.watch(
            `conditions.${conditionIndex}.rules.${ruleIndex}.rule_type`,
          );

          return (
            <div
              key={ruleField.id}
              className="grid gap-3 rounded-md border bg-background p-3 sm:grid-cols-12"
            >
              <div className="sm:col-span-3 space-y-1">
                <Label className="text-xs">Rule Type</Label>
                <Select
                  value={ruleType}
                  onValueChange={(value: "product" | "keyword") =>
                    form.setValue(
                      `conditions.${conditionIndex}.rules.${ruleIndex}.rule_type`,
                      value,
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="product">Product</SelectItem>
                    <SelectItem value="keyword">Keyword</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="sm:col-span-5 space-y-1">
                <Label className="text-xs">
                  {ruleType === "product" ? "Product" : "Keyword"}
                </Label>
                {ruleType === "product" ? (
                  <Select
                    value={
                      form
                        .watch(
                          `conditions.${conditionIndex}.rules.${ruleIndex}.product`,
                        )
                        ?.toString() ?? ""
                    }
                    onValueChange={(value) =>
                      form.setValue(
                        `conditions.${conditionIndex}.rules.${ruleIndex}.product`,
                        Number(value),
                      )
                    }
                    disabled={productsLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem
                          key={product.id}
                          value={product.id.toString()}
                        >
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    {...form.register(
                      `conditions.${conditionIndex}.rules.${ruleIndex}.keyword`,
                    )}
                    placeholder="e.g. shampoo"
                  />
                )}
              </div>

              <div className="sm:col-span-3 space-y-1">
                <Label className="text-xs">Min Qty</Label>
                <Input
                  type="number"
                  min={1}
                  {...form.register(
                    `conditions.${conditionIndex}.rules.${ruleIndex}.min_quantity`,
                  )}
                />
              </div>

              <div className="sm:col-span-1 flex items-end justify-end">
                {ruleFields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => removeRule(ruleIndex)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
