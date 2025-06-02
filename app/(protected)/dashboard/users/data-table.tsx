"use client"

import { useCallback, useEffect, useMemo, useState, useTransition } from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Input } from '@/components/ui/input'
import { UpdateProfileSchema } from '@/schemas'
import { Button } from '@/components/ui/button'
import { useCurrentUser } from '@/hooks/use-current-user'
import { updateProfile } from "@/actions/update-profile"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage
} from '@/components/ui/form'
import { ArrowUpDown, ChevronDown, MoreHorizontal, Shield, ShieldAlert, ShieldCheck, Download, Save } from "lucide-react"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import * as XLSX from 'xlsx'
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { CloudSavingDoneIcon, LoadingIcon } from "@/components/icons"

// Fixed missing type definition for UserTableItem
type UserTableItem = {
  id: string;
  name: string | null;
  email: string | null;
  tempEmail?: string | null;
  role: UserRole;
  emailVerified: boolean;
  isTwoFactorEnabled: boolean;
  createdAt: Date | string | null;
  image?: string | null;
  accounts: { provider: string }[];
  twoFactorConfirmation?: boolean;
}

// Define UserRole as a TypeScript type
type UserRole = "ADMIN" | "USER";

// Define UserRole as a constant object for use in the UI
const UserRoleConstants = {
  ADMIN: "ADMIN",
  USER: "USER",
} as const;

const formatDate = (date: Date | string | null): string => {
  if (!date) return 'N/A'
  const dateObj = typeof date === 'string' ? new Date(date) : date
  if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) return 'Invalid Date'
  return dateObj.toISOString().slice(0, 19).replace('T', ' ')
}

const STATIC_DATE = "2025-04-05 14:45:55"
const CURRENT_USER = "Devambience"

const UserInfo = () => {
  const [currentTime, setCurrentTime] = useState(STATIC_DATE)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const interval = setInterval(() => {
      const now = new Date()
      setCurrentTime(formatDate(now))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col gap-1">
      <div className="text-sm text-muted-foreground">
        Current Date and Time (UTC - YYYY-MM-DD HH:MM:SS formatted): {mounted ? currentTime : STATIC_DATE}
      </div>
      <div className="text-sm text-muted-foreground">
        Current User&apos;s Login: {CURRENT_USER}
      </div>
    </div>
  )
}

const RoleBadge = ({ role }: { role: UserRole }) => {
  const roleConfig = {
    [UserRoleConstants.ADMIN]: {
      style: "",
      icon: <ShieldAlert className="h-4 w-4 mr-1" />
    },
    [UserRoleConstants.USER]: {
      style: "",
      icon: <Shield className="h-4 w-4 mr-1" />
    }
  }

  const { style, icon } = roleConfig[role] || {}

  return (
    <div className={`${style || ''} capitalize flex items-center`}>
      {icon}
      {role.toLowerCase()}
    </div>
  )
}

const TableSkeleton = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-10 w-[250px]" /> {/* Email filter input */}
          <Skeleton className="h-10 w-[140px]" /> {/* Export button */}
          <Skeleton className="h-10 w-[120px]" /> {/* Save changes button */}
        </div>
        <Skeleton className="h-10 w-[120px]" /> {/* Columns dropdown */}
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Skeleton className="h-4 w-4" /> {/* Checkbox */}
              </TableHead>
              <TableHead>
                <Skeleton className="h-4 w-[100px]" /> {/* ID */}
              </TableHead>
              <TableHead>
                <Skeleton className="h-4 w-[200px]" /> {/* Name + Avatar */}
              </TableHead>
              <TableHead>
                <Skeleton className="h-4 w-[200px]" /> {/* Email */}
              </TableHead>
              <TableHead>
                <Skeleton className="h-4 w-[100px]" /> {/* Role */}
              </TableHead>
              <TableHead>
                <Skeleton className="h-4 w-[150px]" /> {/* Status */}
              </TableHead>
              <TableHead>
                <Skeleton className="h-4 w-[150px]" /> {/* Created At */}
              </TableHead>
              <TableHead className="w-[50px]">
                <Skeleton className="h-4 w-4" /> {/* Actions */}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 10 }).map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                <TableCell>
                  <Skeleton className="h-4 w-4" /> {/* Checkbox */}
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-[100px]" /> {/* ID */}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-8 w-8 rounded-full" /> {/* Avatar */}
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[150px]" /> {/* Name */}
                      <Skeleton className="h-3 w-[100px]" /> {/* OAuth Provider */}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[200px]" /> {/* Email */}
                    <Skeleton className="h-3 w-[150px]" /> {/* Temp Email */}
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-8 w-[100px]" /> {/* Role Select */}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-[80px]" /> {/* Verified Badge */}
                    <Skeleton className="h-5 w-[60px]" /> {/* 2FA Badge */}
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-[150px]" /> {/* Created At */}
                </TableCell>
                <TableCell>
                  <Skeleton className="h-8 w-8" /> {/* Actions Button */}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1">
          <Skeleton className="h-4 w-[200px]" /> {/* Selection count */}
        </div>
        <div className="space-x-2">
          <Skeleton className="h-8 w-[80px] inline-block" /> {/* Previous */}
          <Skeleton className="h-8 w-[80px] inline-block" /> {/* Next */}
        </div>
      </div>
    </div>
  )
}

export function DataTable() {
  const [isPending, startTransition] = useTransition()
  const { update } = useSession()
  const user = useCurrentUser()

  const [users, setUsers] = useState<UserTableItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | undefined>()
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<string | null>(null)
  const [hasChanges, setHasChanges] = useState(false)
  const [saving, setSaving] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

  const form = useForm<z.infer<typeof UpdateProfileSchema>>({
    resolver: zodResolver(UpdateProfileSchema),
    defaultValues: {
      name: '',
      email: '',
      role: UserRoleConstants.USER,
      isTwoFactorEnabled: false
    }
  })

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/users')
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      const data = await response.json()
      setUsers(data)
    } catch (error) {
      console.error('Error fetching users:', error)
      setError('Failed to load users')
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [])

  const onSubmit = useCallback(async (values: z.infer<typeof UpdateProfileSchema>) => {
    if (!selectedUserId) {
      toast.error('No user selected for update')
      return
    }

    try {
      setSaving(true)
      const response = await fetch(`/api/users/${selectedUserId}/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...values,
          timestamp: STATIC_DATE,
          updatedBy: CURRENT_USER
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to save changes')
      }

      const data = await response.json()

      setSuccess('Changes saved successfully')
      toast.success('Changes saved successfully')
      setHasChanges(false)
      update()
      await fetchUsers()
    } catch (error) {
      console.error('Error saving changes:', error)
      setError(error instanceof Error ? error.message : 'Failed to save changes')
      toast.error(error instanceof Error ? error.message : 'Failed to save changes')
    } finally {
      setSaving(false)
    }
  }, [selectedUserId, update, fetchUsers])

  const handleSaveChanges = useCallback(() => {
    if (!hasChanges) return

    startTransition(() => {
      const formValues = form.getValues()
      onSubmit(formValues)
    })
  }, [form, hasChanges, onSubmit])

  const handleDeleteUser = useCallback(async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to delete user')
      }

      toast.success('User deleted successfully')
      fetchUsers()
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error('Failed to delete user')
    } finally {
      setDeleteDialogOpen(false)
      setUserToDelete(null)
    }
  }, [fetchUsers])

  const downloadExcel = useCallback(() => {
    try {
      type ExportDataType = {
        'User ID': string;
        'Name': string;
        'Email': string;
        'Temporary Email': string;
        'Role': string;
        'Email Verified': string;
        '2FA Enabled': string;
        'Created At': string;
        'OAuth Providers': string;
      };

      const exportData = users.map(user => ({
        'User ID': user.id,
        'Name': user.name || 'N/A',
        'Email': user.email || 'N/A',
        'Temporary Email': user.tempEmail || 'N/A',
        'Role': user.role,
        'Email Verified': user.emailVerified ? 'Yes' : 'No',
        '2FA Enabled': user.isTwoFactorEnabled ? 'Yes' : 'No',
        'Created At': formatDate(user.createdAt),
        'OAuth Providers': user.accounts?.map((a) => a.provider).join(', ') || 'None'
      })) as ExportDataType[];

      const ws = XLSX.utils.json_to_sheet(exportData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Users')

      const colWidths = Object.keys(exportData[0] || {}).map(key => ({
        wch: Math.max(key.length, ...exportData.map(row => String(row[key as keyof ExportDataType]).length))
      }))
      ws['!cols'] = colWidths

      const fileName = `users_export_${formatDate(new Date()).replace(/[: ]/g, '_')}.xlsx`
      XLSX.writeFile(wb, fileName)
      toast.success('Users data exported successfully')
    } catch (error) {
      console.error('Error exporting data:', error)
      toast.error('Failed to export users data')
    }
  }, [users])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const columns = useMemo<ColumnDef<UserTableItem>[]>(() => [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "id",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <pre>
          <code>
            <div className="font-mono text-xs truncate max-w-[180px]">
              {row.getValue("id")}
            </div>
          </code>
        </pre>
      ),
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-4">
          <Avatar className="h-8 w-8">
            <AvatarImage src={row.original.image || ""} />
            <AvatarFallback>
              {row.original.name?.charAt(0) || row.original.email?.charAt(0) || "?"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <div>{row.original.name || "N/A"}</div>
            {row.original.accounts?.length > 0 && (
              <div className="text-xs text-muted-foreground">
                via {row.original.accounts.map((a) => a.provider).join(", ")}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex flex-col">
          <div className="lowercase">{row.getValue("email") || "No email"}</div>
          {row.original.tempEmail && (
            <div className="text-xs text-muted-foreground">
              Pending: {row.original.tempEmail}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const currentUser = row.original;
        return (
          <Form {...form}>
            <form className="w-full space-y-2">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <Select
                      disabled={isPending || saving}
                      onValueChange={(value) => {
                        setSelectedUserId(currentUser.id);
                        field.onChange(value);
                        setHasChanges(true);
                        form.setValue('name', currentUser.name || '');
                        form.setValue('email', currentUser.email || '');
                        form.setValue('isTwoFactorEnabled', currentUser.isTwoFactorEnabled);
                      }}
                      defaultValue={currentUser.role}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue>
                            <RoleBadge role={currentUser.role} />
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={UserRoleConstants.ADMIN}>Admin</SelectItem>
                        <SelectItem value={UserRoleConstants.USER}>User</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        );
      },
    },
    {
      accessorKey: "emailVerified",
      header: "Status",
      cell: ({ row }) => {
        const verified = row.getValue("emailVerified")
        const twoFactor = row.original.isTwoFactorEnabled
        const has2FA = row.original.twoFactorConfirmation
        return (
          <div className="flex gap-2">
            <Badge>
              {verified ? "Verified" : "Unverified"}
            </Badge>
            {twoFactor && has2FA && (
              <Badge variant="secondary">
                <ShieldCheck className="h-3 w-3 mr-1" />
                2FA
              </Badge>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Created At
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const date = row.getValue("createdAt") as Date | string | null
        return <div className="text-sm">{formatDate(date)}</div>
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const user = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => {
                  navigator.clipboard.writeText(user.id)
                  toast.success('User ID copied to clipboard')
                }}
              >
                Copy user ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>View details</DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setUserToDelete(user.id)
                  setDeleteDialogOpen(true)
                }}
                className="text-red-600"
              >
                Delete user
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ], [form, isPending, saving])

  const table = useReactTable({
    data: users,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  if (loading) return <TableSkeleton />
  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-red-500">{error}</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Filter emails..."
            value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("email")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
          <Button
            onClick={downloadExcel}
            variant="outline"
            className="flex items-center gap-2"
            disabled={saving || isPending}
          >
            <Download className="h-4 w-4" />
            Export to Excel
          </Button>
          {hasChanges && (
            <Button
              onClick={handleSaveChanges}
              disabled={saving || isPending || !selectedUserId}
              className=""
            >
              {saving ? (
                <>
                  <span className="animate-spin"><LoadingIcon /></span>
                </>
              ) : (
                <>
                  <CloudSavingDoneIcon className="h-10 w-10" />
                </>
              )}
            </Button>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) =>
                    column.toggleVisibility(!!value)
                  }
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>

      {userToDelete && (
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you sure?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete the user
                account and remove all associated data.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteDialogOpen(false)
                  setUserToDelete(null)
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => userToDelete && handleDeleteUser(userToDelete)}
              >
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}