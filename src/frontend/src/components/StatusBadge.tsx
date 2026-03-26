import { ParcelStatus } from "../backend.d";

const config: Record<ParcelStatus, { label: string; className: string }> = {
  [ParcelStatus.requested]: {
    label: "Requested",
    className: "bg-muted text-muted-foreground",
  },
  [ParcelStatus.accepted]: {
    label: "Accepted",
    className: "bg-blue-100 text-blue-700",
  },
  [ParcelStatus.inTransit]: {
    label: "In Transit",
    className: "bg-orange-100 text-orange-700",
  },
  [ParcelStatus.delivered]: {
    label: "Delivered",
    className: "bg-carry-mint text-carry-mint",
  },
};

export function StatusBadge({ status }: { status: ParcelStatus }) {
  const { label, className } = config[status] ?? {
    label: String(status),
    className: "bg-muted text-muted-foreground",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
        status === ParcelStatus.delivered
          ? "bg-carry-mint text-carry-mint"
          : className
      }`}
    >
      {label}
    </span>
  );
}
