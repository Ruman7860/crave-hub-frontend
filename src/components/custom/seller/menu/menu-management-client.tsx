"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import {
  createMenuCategory,
  deleteMenuCategory,
  deleteMenuItem,
  updateMenuCategory,
  updateMenuItem,
} from "@/actions/seller/seller.actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Edit3,
  ImagePlus,
  Leaf,
  MoreVertical,
  Plus,
  Search,
  Sparkles,
  Star,
  Tag,
  Trash2,
  UtensilsCrossed,
} from "lucide-react";
import { toast } from "sonner";
import {
  getErrorMessage,
  INR_FORMATTER,
  MENU_CATEGORY_SUGGESTIONS,
  MenuCategory,
  MenuData,
  MenuItem,
} from "./menu-types";

const categorySchema = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters."),
  description: z.string().optional(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

function formatPrice(value: number) {
  return INR_FORMATTER.format(value);
}

export function MenuManagementClient({ initialData }: { initialData: MenuData }) {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("all");
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [savingCategory, setSavingCategory] = useState(false);
  const [busyItemId, setBusyItemId] = useState<string | null>(null);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const categories = useMemo(() => initialData.categories ?? [], [initialData.categories]);
  const items = useMemo(() => initialData.items ?? [], [initialData.items]);
  const hasCategories = categories.length > 0;

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const filteredItems = useMemo(() => {
    if (activeCategory === "all") return items;
    return items.filter((item) => item.categoryId === activeCategory);
  }, [activeCategory, items]);

  const categoryCounts = useMemo(() => {
    return items.reduce<Record<string, number>>((acc, item) => {
      acc[item.categoryId] = (acc[item.categoryId] ?? 0) + 1;
      return acc;
    }, {});
  }, [items]);

  const availableSuggestions = useMemo(() => {
    const existing = new Set(categories.map((category) => category.name.toLowerCase()));
    return MENU_CATEGORY_SUGGESTIONS.filter((name) => !existing.has(name.toLowerCase()));
  }, [categories]);

  const refreshMenu = () => router.refresh();

  const resetCategoryForm = () => {
    setEditingCategory(null);
    form.reset({ name: "", description: "" });
  };

  const openCreateCategory = () => {
    resetCategoryForm();
    setCategoryDialogOpen(true);
  };

  const submitCategory = async (data: CategoryFormValues) => {
    setSavingCategory(true);

    try {
      const payload = {
        name: data.name.trim(),
        description: data.description?.trim() ?? "",
      };
      const result = editingCategory
        ? await updateMenuCategory(editingCategory.id, payload)
        : await createMenuCategory(payload);
      const error = getErrorMessage(result, "Failed to save menu category");

      if (error) {
        toast.error(error);
        return;
      }

      toast.success(editingCategory ? "Category updated" : "Category created");
      resetCategoryForm();
      setCategoryDialogOpen(false);
      refreshMenu();
    } finally {
      setSavingCategory(false);
    }
  };

  const createSuggestedCategory = async (name: string) => {
    setSavingCategory(true);

    try {
      const result = await createMenuCategory({ name, description: "" });
      const error = getErrorMessage(result, "Failed to create menu category");

      if (error) {
        toast.error(error);
        return;
      }

      toast.success(`${name} added`);
      setCategoryDialogOpen(false);
      refreshMenu();
    } finally {
      setSavingCategory(false);
    }
  };

  const startEditCategory = (category: MenuCategory) => {
    setEditingCategory(category);
    form.reset({
      name: category.name,
      description: category.description ?? "",
    });
    setCategoryDialogOpen(true);
  };

  const removeCategory = async (category: MenuCategory) => {
    const count = categoryCounts[category.id] ?? 0;
    if (count > 0) {
      toast.error("Move or delete items in this category before deleting it.");
      return;
    }

    if (!window.confirm(`Delete ${category.name}?`)) return;

    const result = await deleteMenuCategory(category.id);
    const error = getErrorMessage(result, "Failed to delete menu category");

    if (error) {
      toast.error(error);
      return;
    }

    toast.success("Category deleted");
    if (activeCategory === category.id) setActiveCategory("all");
    refreshMenu();
  };

  const toggleAvailability = async (item: MenuItem) => {
    setBusyItemId(item.id);

    try {
      const formData = new FormData();
      formData.set("isAvailable", item.isAvailable ? "false" : "true");
      const result = await updateMenuItem(item.id, formData);
      const error = getErrorMessage(result, "Failed to update availability");

      if (error) {
        toast.error(error);
        return;
      }

      toast.success(item.isAvailable ? "Marked out of stock" : "Marked available");
      refreshMenu();
    } finally {
      setBusyItemId(null);
    }
  };

  const removeItem = async (item: MenuItem) => {
    if (!window.confirm(`Delete ${item.name}?`)) return;

    setBusyItemId(item.id);

    try {
      const result = await deleteMenuItem(item.id);
      const error = getErrorMessage(result, "Failed to delete menu item");

      if (error) {
        toast.error(error);
        return;
      }

      toast.success("Menu item deleted");
      refreshMenu();
    } finally {
      setBusyItemId(null);
    }
  };

  const columns: ColumnDef<MenuItem>[] = useMemo(
    () => [
      {
        accessorKey: "image",
        header: "Image",
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="relative h-12 w-12 rounded-lg bg-gray-100 dark:bg-zinc-900 overflow-hidden shrink-0 border border-gray-200 dark:border-zinc-800">
              {item.image ? (
                <Image src={item.image} alt={item.name} fill className="object-cover" />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  <ImagePlus className="w-5 h-5 opacity-50" />
                </div>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "name",
        header: "Item Name",
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div>
              <div className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                {item.name}
                {item.isBestseller && (
                  <Badge className="bg-orange-600 hover:bg-orange-700 text-white border-none py-0 px-1.5 h-5 text-[10px]">
                    <Star className="w-3 h-3" />
                    Bestseller
                  </Badge>
                )}
              </div>
              <div className="text-xs text-gray-500 max-w-50 truncate" title={item.description || ""}>
                {item.description || "No description"}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "category.name",
        id: "categoryName",
        header: "Category",
        cell: ({ row }) => (
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {row.original.category?.name}
          </span>
        ),
      },
      {
        id: "priceInfo",
        header: "Price",
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div>
              {item.discountedPrice !== null ? (
                <>
                  <div className="font-bold text-orange-600">{formatPrice(item.discountedPrice)}</div>
                  <div className="text-xs text-gray-400 line-through">{formatPrice(item.price)}</div>
                </>
              ) : (
                <div className="font-bold text-gray-900 dark:text-gray-100">{formatPrice(item.price)}</div>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "isVeg",
        header: "Type",
        cell: ({ row }) => {
          const isVeg = row.original.isVeg;
          if (isVeg === null) return <span className="text-gray-400 text-sm">-</span>;
          return (
            <Badge
              variant="outline"
              className={
                isVeg
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-red-50 text-red-700 border-red-200"
              }
            >
              <Leaf className="w-3 h-3 mr-1" />
              {isVeg ? "Veg" : "Non-Veg"}
            </Badge>
          );
        },
        filterFn: (row, id, value) => {
          if (value === "all") return true;
          if (value === "veg") return row.original.isVeg === true;
          if (value === "nonveg") return row.original.isVeg === false;
          return true;
        },
      },
      {
        accessorKey: "isAvailable",
        header: "Availability",
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex items-center gap-2">
              <Switch
                checked={item.isAvailable}
                disabled={busyItemId === item.id}
                onCheckedChange={() => toggleAvailability(item)}
                className="data-checked:bg-amber-600 data-unchecked:bg-input"
              />
              <span className={cn("text-sm", item.isAvailable ? "text-green-600 font-medium" : "text-gray-500")}>
                {item.isAvailable ? "Available" : "Out of Stock"}
              </span>
            </div>
          );
        },
        filterFn: (row, id, value) => {
          if (value === "all") return true;
          if (value === "available") return row.original.isAvailable === true;
          if (value === "outofstock") return row.original.isAvailable === false;
          return true;
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const item = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0" disabled={busyItemId === item.id}>
                  <span className="sr-only">Open menu</span>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/menu/items/${item.id}/edit`} className="cursor-pointer">
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => removeItem(item)} className="text-red-600 cursor-pointer">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [busyItemId]
  );

  const table = useReactTable({
    data: filteredItems,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
    initialState: {
      pagination: {
        pageSize: 50,
      },
    },
  });

  return (
    <div className="max-w-7xl mx-auto py-2 px-4 sm:px-6 space-y-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Menu
          </h1>
          <p className="text-gray-500 mt-1">Build your catalog, keep items available, and update prices quickly.</p>
        </div>
        <Button
          asChild={hasCategories}
          disabled={!hasCategories}
          className="bg-orange-600 hover:bg-orange-700 text-white shadow-sm"
        >
          {hasCategories ? (
            <Link href="/menu/items/new">
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Link>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 items-start">
        <Card className="shadow-sm pt-4 lg:sticky lg:top-20">
          <CardHeader className="border-b border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50 pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Tag className="w-5 h-5 text-orange-600" />
              Categories
            </CardTitle>
            <CardDescription className="text-xs">Filter and manage menu categories.</CardDescription>
          </CardHeader>
          <CardContent className="pb-4 space-y-4">
            <Button size={"sm"} type="button" onClick={openCreateCategory} className="w-full bg-orange-600 hover:bg-orange-700 text-white text-xs">
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>

            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setActiveCategory("all")}
                className={cn(
                  "w-full flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  activeCategory === "all"
                    ? "bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-gray-100 font-semibold"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-900",
                )}
              >
                <span>All Categories</span>
                <Badge variant="outline" className="ml-2 font-normal">{items.length}</Badge>
              </button>

              {categories.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-500 dark:border-zinc-800 dark:bg-zinc-900/40 text-center mt-2">
                  No categories yet. Use Add Category to start building your menu.
                </div>
              ) : (
                <div className="mt-2 space-y-0.5">
                  {categories.map((category) => (
                    <div key={category.id} className="group flex items-center gap-1 relative">
                      <button
                        type="button"
                        onClick={() => setActiveCategory(category.id)}
                        className={cn(
                          "w-full flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors text-left pr-16",
                          activeCategory === category.id
                            ? "bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-gray-100 font-semibold"
                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-900",
                        )}
                      >
                        <span className="truncate">{category.name}</span>
                        <Badge variant="outline" className="font-normal shrink-0">{categoryCounts[category.id] ?? 0}</Badge>
                      </button>
                      <div className="absolute right-1 top-1/2 -translate-y-1/2 flex opacity-0 group-hover:opacity-100 transition-opacity bg-linear-to-l from-gray-50 dark:from-zinc-900 pl-2 rounded-r-lg">
                        <button type="button" onClick={() => startEditCategory(category)} className="p-1.5 text-gray-400 hover:text-orange-600 transition-colors rounded-md" aria-label={`Edit ${category.name}`}>
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button type="button" onClick={() => removeCategory(category)} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors rounded-md" aria-label={`Delete ${category.name}`}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {!hasCategories ? (
            <div className="min-h-100 flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 dark:border-zinc-800 bg-gray-50/60 dark:bg-zinc-900/40 text-center p-8">
              <Tag className="w-12 h-12 text-gray-300 mb-3" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Create a category first</h2>
              <p className="text-sm text-gray-500 mt-1 max-w-md">Categories keep your seller dashboard tidy and make future ordering and drag-and-drop support straightforward.</p>
              <Button type="button" onClick={openCreateCategory} className="mt-5 bg-orange-600 hover:bg-orange-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </Button>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="min-h-100 flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 dark:border-zinc-800 bg-gray-50/60 dark:bg-zinc-900/40 text-center p-8">
              <UtensilsCrossed className="w-12 h-12 text-gray-300 mb-3" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">No menu items yet</h2>
              <p className="text-sm text-gray-500 mt-1">Add your first item with pricing, category, availability, and a food photo.</p>
              <Button size={"sm"} asChild className="mt-5 bg-orange-600 hover:bg-orange-700 text-white">
                <Link href="/menu/items/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Table Toolbar */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search items..."
                    value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                      table.getColumn("name")?.setFilterValue(event.target.value)
                    }
                    className="pl-9 h-10 w-full md:max-w-75 rounded-lg border border-gray-300 bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={(table.getColumn("isVeg")?.getFilterValue() as string) ?? "all"}
                    onValueChange={(value) =>
                      table.getColumn("isVeg")?.setFilterValue(value)
                    }
                  >
                    <SelectTrigger className="w-30 h-10">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="veg">Veg Only</SelectItem>
                      <SelectItem value="nonveg">Non-Veg Only</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={(table.getColumn("isAvailable")?.getFilterValue() as string) ?? "all"}
                    onValueChange={(value) =>
                      table.getColumn("isAvailable")?.setFilterValue(value)
                    }
                  >
                    <SelectTrigger className="w-35 h-10">
                      <SelectValue placeholder="Availability" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="outofstock">Out of Stock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden shadow-sm">
                <Table>
                  <TableHeader className="bg-gray-50/80 dark:bg-zinc-900/50">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => {
                          return (
                            <TableHead key={header.id} className="h-11 py-2 font-semibold text-gray-600 dark:text-gray-300 text-sm whitespace-nowrap">
                              {header.isPlaceholder
                                ? null
                                : flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                  )}
                            </TableHead>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {table.getRowModel().rows?.length ? (
                      table.getRowModel().rows.map((row) => (
                        <TableRow
                          key={row.id}
                          data-state={row.getIsSelected() && "selected"}
                          className="hover:bg-gray-50 dark:hover:bg-zinc-900/50 transition-colors"
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id} className="py-3">
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={columns.length} className="h-32 text-center text-gray-500">
                          No results found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                {table.getFilteredRowModel().rows.length > 50 && (
                  <div className="flex items-center justify-between py-3 px-4 border-t border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/30 text-sm text-gray-500">
                    <div>
                      Showing {table.getRowModel().rows.length} of {table.getFilteredRowModel().rows.length} items
                    </div>
                    <div className="space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        className="h-8"
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        className="h-8"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Compact Cards View */}
              <div className="block md:hidden space-y-3">
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <CompactMenuItemCard
                      key={row.original.id}
                      item={row.original}
                      busy={busyItemId === row.original.id}
                      onToggleAvailability={toggleAvailability}
                      onDelete={removeItem}
                    />
                  ))
                ) : (
                  <div className="py-12 text-center text-sm text-gray-500 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl">
                    No results found.
                  </div>
                )}
                {table.getFilteredRowModel().rows.length > 50 && (
                  <div className="flex items-center justify-between pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => table.previousPage()}
                      disabled={!table.getCanPreviousPage()}
                    >
                      Previous
                    </Button>
                    <span className="text-xs text-gray-500">
                      Page {table.getState().pagination.pageIndex + 1}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => table.nextPage()}
                      disabled={!table.getCanNextPage()}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <Dialog
        open={categoryDialogOpen}
        onOpenChange={(open) => {
          setCategoryDialogOpen(open);
          if (!open) resetCategoryForm();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Edit Category" : "Add Category"}</DialogTitle>
            <DialogDescription>
              Categories group menu items and prepare the menu for future ordering controls.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(submitCategory)} className="space-y-4">
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <div className="space-y-1.5">
                  <Label htmlFor="categoryName">Category Name *</Label>
                  <Input
                    id="categoryName"
                    {...field}
                    placeholder="e.g. Starters"
                    className={fieldState.error ? "border-red-500 focus-visible:ring-red-500/20" : ""}
                  />
                  {fieldState.error && (
                    <p className="text-[13px] font-medium text-red-500 ml-1">{fieldState.error.message}</p>
                  )}
                </div>
              )}
            />

            <Controller
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <div className="space-y-1.5">
                  <Label htmlFor="categoryDescription">Description</Label>
                  <Input
                    id="categoryDescription"
                    {...field}
                    placeholder="Optional internal note"
                    className={fieldState.error ? "border-red-500 focus-visible:ring-red-500/20" : ""}
                  />
                  {fieldState.error && (
                    <p className="text-[13px] font-medium text-red-500 ml-1">{fieldState.error.message}</p>
                  )}
                </div>
              )}
            />

            {!editingCategory && availableSuggestions.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase text-gray-500">
                  <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                  Quick Add
                </div>
                <div className="flex flex-wrap gap-2">
                  {availableSuggestions.slice(0, 10).map((name) => (
                    <button
                      key={name}
                      type="button"
                      disabled={savingCategory}
                      onClick={() => createSuggestedCategory(name)}
                      className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700 transition hover:bg-orange-100 disabled:opacity-60 dark:border-orange-900/50 dark:bg-orange-950/30 dark:text-orange-300"
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCategoryDialogOpen(false)}
                disabled={savingCategory}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={savingCategory} className="bg-orange-600 hover:bg-orange-700 text-white">
                {savingCategory ? "Saving..." : editingCategory ? "Save Changes" : "Create Category"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CompactMenuItemCard({
  item,
  busy,
  onToggleAvailability,
  onDelete,
}: {
  item: MenuItem;
  busy: boolean;
  onToggleAvailability: (item: MenuItem) => void;
  onDelete: (item: MenuItem) => void;
}) {
  return (
    <div className="flex flex-col gap-3 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl p-3 shadow-sm">
      <div className="flex gap-3">
        {/* Image */}
        <div className="relative h-16 w-16 rounded-lg bg-gray-100 dark:bg-zinc-900 overflow-hidden shrink-0 border border-gray-100 dark:border-zinc-800">
          {item.image ? (
            <Image src={item.image} alt={item.name} fill className="object-cover" />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              <ImagePlus className="w-6 h-6 opacity-50" />
            </div>
          )}
        </div>
        
        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">{item.name}</h3>
            <div className="text-right shrink-0">
               {item.discountedPrice !== null ? (
                  <>
                    <p className="font-bold text-orange-600 text-sm">{formatPrice(item.discountedPrice)}</p>
                    <p className="text-[10px] text-gray-400 line-through">{formatPrice(item.price)}</p>
                  </>
                ) : (
                  <p className="font-bold text-gray-900 dark:text-gray-100 text-sm">{formatPrice(item.price)}</p>
                )}
            </div>
          </div>
          <div className="flex items-center gap-2 mt-1">
             <span className="text-xs text-gray-500 font-medium truncate">{item.category?.name}</span>
             {item.isVeg !== null && (
                <Badge
                  variant="outline"
                  className={cn("py-0 px-1.5 h-4 text-[9px] uppercase tracking-wider", item.isVeg
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-red-50 text-red-700 border-red-200")}
                >
                  {item.isVeg ? "Veg" : "Non-Veg"}
                </Badge>
              )}
              {item.isBestseller && (
                <Badge className="bg-orange-600 text-white border-none py-0 px-1.5 h-4 text-[9px]">
                  Bestseller
                </Badge>
              )}
          </div>
        </div>
      </div>
      
      {/* Footer / Actions */}
      <div className="flex items-center justify-between border-t border-gray-100 dark:border-zinc-800 pt-3 mt-1">
        <div className="flex items-center gap-2">
          <Switch
            checked={item.isAvailable}
            disabled={busy}
            onCheckedChange={() => onToggleAvailability(item)}
            className="scale-90 data-[state=checked]:bg-green-600"
          />
          <span className={cn("text-xs font-medium", item.isAvailable ? "text-green-600" : "text-gray-500")}>
             {item.isAvailable ? "Available" : "Out of Stock"}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
           <Button variant="outline" size="sm" className="h-7 text-xs px-2.5" asChild>
              <Link href={`/menu/items/${item.id}/edit`}>
                 <Edit3 className="w-3 h-3 mr-1.5" />
                 Edit
              </Link>
           </Button>
           <Button variant="outline" size="sm" className="h-7 w-7 p-0 text-red-600 hover:text-red-700" disabled={busy} onClick={() => onDelete(item)}>
              <Trash2 className="w-3.5 h-3.5" />
              <span className="sr-only">Delete</span>
           </Button>
        </div>
      </div>
    </div>
  );
}