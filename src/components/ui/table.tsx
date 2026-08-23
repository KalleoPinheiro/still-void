import * as React from "react"
import { cn } from "../../lib/utils"
import { table, tableClasses } from "../../recipes/table"

export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  containerClassName?: string
}

const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, containerClassName, ...props }, ref) => (
    <div className={cn(tableClasses.container, containerClassName)}>
      <table className={cn(table(), className)} ref={ref} {...props} />
    </div>
  )
)
Table.displayName = "Table"

export interface TableHeaderProps
  extends React.HTMLAttributes<HTMLTableSectionElement> {}

const TableHeader = React.forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ className, ...props }, ref) => (
    <thead className={cn(tableClasses.head, className)} ref={ref} {...props} />
  )
)
TableHeader.displayName = "TableHeader"

export interface TableBodyProps
  extends React.HTMLAttributes<HTMLTableSectionElement> {}

const TableBody = React.forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ className, ...props }, ref) => (
    <tbody className={cn(tableClasses.body, className)} ref={ref} {...props} />
  )
)
TableBody.displayName = "TableBody"

export interface TableFooterProps
  extends React.HTMLAttributes<HTMLTableSectionElement> {}

const TableFooter = React.forwardRef<HTMLTableSectionElement, TableFooterProps>(
  ({ className, ...props }, ref) => (
    <tfoot className={cn(tableClasses.foot, className)} ref={ref} {...props} />
  )
)
TableFooter.displayName = "TableFooter"

export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {}

const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, ...props }, ref) => (
    <tr className={cn(tableClasses.row, className)} ref={ref} {...props} />
  )
)
TableRow.displayName = "TableRow"

export interface TableHeadProps
  extends React.ThHTMLAttributes<HTMLTableCellElement> {}

const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, ...props }, ref) => (
    <th className={cn(tableClasses.th, className)} ref={ref} {...props} />
  )
)
TableHead.displayName = "TableHead"

export interface TableCellProps
  extends React.TdHTMLAttributes<HTMLTableCellElement> {}

const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, ...props }, ref) => (
    <td className={cn(tableClasses.td, className)} ref={ref} {...props} />
  )
)
TableCell.displayName = "TableCell"

export interface TableCaptionProps
  extends React.HTMLAttributes<HTMLTableCaptionElement> {}

const TableCaption = React.forwardRef<HTMLTableCaptionElement, TableCaptionProps>(
  ({ className, ...props }, ref) => (
    <caption className={cn(tableClasses.caption, className)} ref={ref} {...props} />
  )
)
TableCaption.displayName = "TableCaption"

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
}
