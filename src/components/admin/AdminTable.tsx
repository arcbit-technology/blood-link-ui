import type { ReactNode } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import styles from "./admin.module.css";

interface AdminTableProps {
  columns: string[];
  rows: { id: string; cells: ReactNode[] }[];
  emptyMessage: string;
}

export function AdminTable({ columns, rows, emptyMessage }: AdminTableProps) {
  if (!rows.length) return <p role="status" className="py-14 text-center text-sm text-muted-foreground">{emptyMessage}</p>;

  return (
    <div className={styles.records}>
      <Table>
        <TableHeader><TableRow>{columns.map((label) => <TableHead key={label}>{label}</TableHead>)}</TableRow></TableHeader>
        <TableBody>{rows.map(({ id, cells }) => <TableRow key={id}>{cells.map((cell, index) => <TableCell key={columns[index]} data-label={columns[index]}>{cell}</TableCell>)}</TableRow>)}</TableBody>
      </Table>
    </div>
  );
}
