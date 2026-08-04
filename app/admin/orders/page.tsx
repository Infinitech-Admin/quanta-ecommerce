"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Eye,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
  Copy,
  Check,
} from "lucide-react";

import { AdminSidebar } from "@/components/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { formatPHP } from "@/lib/utils";

type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

type OrderItem = {
  id: number;
  product_id: string;
  name: string;
  price: number | string;
  qty: number;
};

type Order = {
  id: number;
  tracking_number: string | null;
  email: string;
  first_name: string;
  last_name: string;
  address: string;
  city: string;
  zip: string;
  phone: string;
  payment_method: "gcash" | "maya" | "bank" | "qr" | "cod";
  proof_path: string | null;
  subtotal: number | string;
  total: number | string;
  status: OrderStatus;
  items: OrderItem[];
  created_at: string;
};

const PAYMENT_LABELS: Record<Order["payment_method"], string> = {
  gcash: "GCash",
  maya: "Maya",
  bank: "Bank transfer",
  qr: "Scan QR",
  cod: "Cash on delivery",
};

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

const FILTER_OPTIONS = [
  { value: "all", label: "All statuses" },
  ...STATUS_OPTIONS,
];

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-moss-50 text-moss-700 border-moss-200",
  processing: "bg-moss-50 text-moss-700 border-moss-200",
  shipped: "bg-sky-50 text-sky-700 border-sky-200",
  delivered: "bg-green-50 text-green-700 border-green-200",
  cancelled: "bg-red-50 text-red-600 border-red-200",
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const label = STATUS_OPTIONS.find((s) => s.value === status)?.label ?? status;
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${STATUS_STYLES[status]}`}
    >
      {label}
    </span>
  );
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // view / edit dialog
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editStatus, setEditStatus] = useState<OrderStatus>("pending");
  const [editTracking, setEditTracking] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  // Row-level quick status updates (separate from the dialog's save state)
  const [updatingRowId, setUpdatingRowId] = useState<number | null>(null);

  async function fetchOrders() {
    setIsLoading(true);
    setLoadError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter !== "all") params.set("status", statusFilter);

      const res = await fetch(`/api/admin/orders?${params.toString()}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to load orders");
      const data = await res.json();

      const list: Order[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.orders)
          ? data.orders
          : Array.isArray(data?.data)
            ? data.data
            : [];

      setOrders(list);
    } catch (err) {
      setLoadError(
        err instanceof Error ? err.message : "Failed to load orders",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchOrders();
    }, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter]);

  const filtered = useMemo(
    () => (Array.isArray(orders) ? orders : []),
    [orders],
  );

  // Pagination — 10 rows per page
  const PAGE_SIZE = 10;
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const rangeStart = filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, filtered.length);

  async function updateOrder(
    orderId: number,
    payload: { status?: OrderStatus; tracking_number?: string },
  ) {
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to update order");
    return (await res.json()) as Order;
  }

  // Quick inline status change directly from the table row.
  async function handleQuickStatusChange(order: Order, status: OrderStatus) {
    setUpdatingRowId(order.id);
    // Optimistic update
    setOrders((prev) =>
      prev.map((o) => (o.id === order.id ? { ...o, status } : o)),
    );
    try {
      const updated = await updateOrder(order.id, { status });
      setOrders((prev) => prev.map((o) => (o.id === order.id ? updated : o)));
    } catch (err) {
      await fetchOrders(); // roll back on failure
      alert(err instanceof Error ? err.message : "Failed to update order");
    } finally {
      setUpdatingRowId(null);
    }
  }

  function openViewDialog(order: Order) {
    setSelectedOrder(order);
    setEditStatus(order.status);
    setEditTracking(order.tracking_number ?? "");
  }

  async function handleSaveDialog() {
    if (!selectedOrder) return;
    setIsSaving(true);
    try {
      const updated = await updateOrder(selectedOrder.id, {
        status: editStatus,
        tracking_number: editTracking || undefined,
      });
      setOrders((prev) =>
        prev.map((o) => (o.id === selectedOrder.id ? updated : o)),
      );
      setSelectedOrder(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update order");
    } finally {
      setIsSaving(false);
    }
  }

  async function copyTracking(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard not available — silently ignore.
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-moss-50/40 md:flex-row">
      <AdminSidebar />

      <main className="flex-1 px-6 py-6 md:px-8 md:py-8">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="font-display text-2xl font-semibold text-moss-900">
              Orders
            </h1>
            <p className="text-sm text-muted-foreground">
              {orders.length} orders total.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={fetchOrders}
            className="gap-1.5"
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>

        {/* Filters */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, tracking #..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="sm:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              {FILTER_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center gap-2 rounded-2xl border border-moss-200 bg-white py-10 text-sm text-muted-foreground shadow-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading orders...
          </div>
        )}

        {!isLoading && loadError && (
          <div className="rounded-2xl border border-moss-200 bg-white py-10 text-center text-sm text-red-600 shadow-sm">
            {loadError}
          </div>
        )}

        {!isLoading && !loadError && filtered.length === 0 && (
          <div className="rounded-2xl border border-moss-200 bg-white py-10 text-center text-sm text-muted-foreground shadow-sm">
            No orders match your search.
          </div>
        )}

        {!isLoading && !loadError && filtered.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-moss-200 bg-white shadow-sm">
            {/* Table — md and up */}
            <div className="hidden overflow-x-auto md:block">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-moss-200 bg-moss-50 hover:bg-moss-50">
                    <TableHead>Order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Placed</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.map((order) => (
                    <TableRow
                      key={order.id}
                      className="border-b border-moss-100 last:border-0 hover:bg-moss-50/70"
                    >
                      <TableCell>
                        <p className="text-sm font-medium text-moss-900">
                          #{order.id}
                        </p>
                        {order.tracking_number && (
                          <p className="text-[11px] text-muted-foreground">
                            {order.tracking_number}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="max-w-[180px]">
                        <p className="truncate text-sm font-medium text-moss-900">
                          {order.first_name} {order.last_name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {order.email}
                        </p>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">
                          {order.items.length}{" "}
                          {order.items.length === 1 ? "item" : "items"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-moss-900">
                          {formatPHP(Number(order.total))}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">
                          {PAYMENT_LABELS[order.payment_method]}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={order.status}
                          onValueChange={(v) =>
                            handleQuickStatusChange(order, v as OrderStatus)
                          }
                          disabled={updatingRowId === order.id}
                        >
                          <SelectTrigger className="h-8 w-[130px] text-xs">
                            <SelectValue>
                              <StatusBadge status={order.status} />
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(order.created_at)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-moss-600 hover:text-moss-900"
                            onClick={() => openViewDialog(order)}
                            aria-label={`View order ${order.id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Card list — below md */}
            <div className="divide-y divide-moss-100 md:hidden">
              {paginated.map((order) => (
                <button
                  key={order.id}
                  onClick={() => openViewDialog(order)}
                  className="flex w-full flex-col gap-1.5 px-4 py-3 text-left"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-moss-900">
                        Order #{order.id}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {order.first_name} {order.last_name} · {order.email}
                      </p>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span className="font-medium text-moss-900">
                      {formatPHP(Number(order.total))}
                    </span>
                    <span>
                      {order.items.length}{" "}
                      {order.items.length === 1 ? "item" : "items"}
                    </span>
                    <span>{PAYMENT_LABELS[order.payment_method]}</span>
                    <span>{formatDate(order.created_at)}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex flex-col items-center justify-between gap-3 border-t border-moss-100 px-4 py-3 sm:flex-row">
              <p className="text-xs text-muted-foreground">
                Showing{" "}
                <span className="font-medium text-moss-800">
                  {rangeStart}–{rangeEnd}
                </span>{" "}
                of{" "}
                <span className="font-medium text-moss-800">
                  {filtered.length}
                </span>{" "}
                orders
              </p>

              <div className="flex flex-wrap items-center justify-center gap-1.5">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (pageNum) => (
                    <Button
                      key={pageNum}
                      size="icon"
                      variant={pageNum === page ? "default" : "outline"}
                      className="h-8 w-8 text-xs"
                      onClick={() => setPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  ),
                )}

                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* View / Edit dialog */}
      <Dialog
        open={!!selectedOrder}
        onOpenChange={(open) => !open && setSelectedOrder(null)}
      >
        <DialogContent className="flex max-h-[88vh] max-w-lg flex-col gap-0 overflow-hidden p-0">
          {selectedOrder && (
            <>
              <DialogHeader className="border-b border-moss-100 px-6 py-4">
                <DialogTitle>Order #{selectedOrder.id}</DialogTitle>
                <DialogDescription>
                  Placed {formatDate(selectedOrder.created_at)}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 overflow-y-auto px-6 py-4">
                {/* Customer */}
                <div className="rounded-xl border border-moss-100 bg-moss-50/60 p-3">
                  <p className="text-xs font-semibold text-moss-800">
                    Shipping to
                  </p>
                  <p className="mt-0.5 text-sm text-moss-900">
                    {selectedOrder.first_name} {selectedOrder.last_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {selectedOrder.address}, {selectedOrder.city}{" "}
                    {selectedOrder.zip}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {selectedOrder.phone} · {selectedOrder.email}
                  </p>
                </div>

                {/* Items */}
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-moss-800">Items</p>
                  {selectedOrder.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between text-xs text-moss-700"
                    >
                      <span className="min-w-0 flex-1 truncate pr-2">
                        {item.qty}× {item.name}
                      </span>
                      <span className="shrink-0 text-moss-900">
                        {formatPHP(Number(item.price) * item.qty)}
                      </span>
                    </div>
                  ))}
                  <div className="mt-2 border-t border-dashed border-moss-200 pt-2">
                    <div className="flex justify-between text-xs text-moss-600">
                      <span>Subtotal</span>
                      <span>{formatPHP(Number(selectedOrder.subtotal))}</span>
                    </div>
                    <div className="mt-1 flex justify-between text-sm font-semibold text-moss-900">
                      <span>Total</span>
                      <span>{formatPHP(Number(selectedOrder.total))}</span>
                    </div>
                  </div>
                </div>

                <div className="grid gap-1.5">
                  <Label>Payment method</Label>
                  <p className="text-sm text-moss-700">
                    {PAYMENT_LABELS[selectedOrder.payment_method]}
                  </p>
                </div>

                {/* Editable fields */}
                <div className="grid gap-1.5">
                  <Label htmlFor="editStatus">Status</Label>
                  <Select
                    value={editStatus}
                    onValueChange={(v) => setEditStatus(v as OrderStatus)}
                  >
                    <SelectTrigger id="editStatus">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="editTracking">Tracking number</Label>
                  <div className="flex gap-2">
                    <Input
                      id="editTracking"
                      value={editTracking}
                      onChange={(e) => setEditTracking(e.target.value)}
                      placeholder="e.g. LBC1234567890"
                    />
                    {editTracking && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => copyTracking(editTracking)}
                        aria-label="Copy tracking number"
                      >
                        {copied ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <DialogFooter className="border-t border-moss-100 px-6 py-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedOrder(null)}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveDialog} disabled={isSaving}>
                  {isSaving && (
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  )}
                  Save Changes
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
