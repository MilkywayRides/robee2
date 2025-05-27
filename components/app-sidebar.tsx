"use client"

import * as React from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { useCurrentUser } from '@/hooks/use-current-user'
import { HomeIcon, FileAddIcon, UserMultipleIcon, SettingsIcon} from "@/components/icons"

import {
  ArrowUpCircleIcon,
  CameraIcon,
  ClipboardListIcon,
  DatabaseIcon,
  FileCodeIcon,
  FileIcon,
  FileTextIcon,
  FolderIcon,
  HelpCircleIcon,
  ListIcon,
  SearchIcon,
} from "lucide-react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const STATIC_DATE = "2025-04-05 15:26:09"
const CURRENT_USER = "Devambience"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter()
  const pathname = usePathname()
  const user = useCurrentUser()

  const data = {
    user: {
      name: user?.name || CURRENT_USER,
      email: user?.email || '',
      avatar: user?.image || '',
    },
    navMain: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: HomeIcon,
      },
      {
        title: "Users",
        url: "/dashboard/users",
        icon: UserMultipleIcon,
      },
      {
        title: "Posts",
        url: "/dashboard/posts",
        icon: FileAddIcon,
      },
      {
        title: "Projects",
        url: "/dashboard/projects",
        icon: FolderIcon,
      },
      {
        title: "Team",
        url: "/dashboard/team",
        icon: ListIcon,
      },
    ].map(item => ({
      ...item,
      isActive: pathname === item.url
    })),
    navClouds: [
      {
        title: "Capture",
        icon: CameraIcon,
        url: "/dashboard/capture",
        items: [
          {
            title: "Active Proposals",
            url: "/dashboard/capture/active",
          },
          {
            title: "Archived",
            url: "/dashboard/capture/archived",
          },
        ],
      },
      {
        title: "Proposal",
        icon: FileTextIcon,
        url: "/dashboard/proposals",
        items: [
          {
            title: "Active Proposals",
            url: "/dashboard/proposals/active",
          },
          {
            title: "Archived",
            url: "/dashboard/proposals/archived",
          },
        ],
      },
      {
        title: "Prompts",
        icon: FileCodeIcon,
        url: "/dashboard/prompts",
        items: [
          {
            title: "Active Proposals",
            url: "/dashboard/prompts/active",
          },
          {
            title: "Archived",
            url: "/dashboard/prompts/archived",
          },
        ],
      },
    ].map(item => ({
      ...item,
      isActive: pathname.startsWith(item.url)
    })),
    navSecondary: [
      {
        title: "Settings",
        url: "/settings",
        icon: SettingsIcon,
      },
      {
        title: "Get Help",
        url: "/help",
        icon: HelpCircleIcon,
      },
      {
        title: "Search",
        url: "/search",
        icon: SearchIcon,
      },
    ].map(item => ({
      ...item,
      isActive: pathname === item.url
    })),
    documents: [
      {
        name: "Data Library",
        url: "/dashboard/library",
        icon: DatabaseIcon,
      },
      {
        name: "Reports",
        url: "/dashboard/reports",
        icon: ClipboardListIcon,
      },
      {
        name: "Word Assistant",
        url: "/dashboard/assistant",
        icon: FileIcon,
      },
    ].map(item => ({
      ...item,
      isActive: pathname === item.url
    })),
  }

  const handleNavigation = (url: string) => {
    if (url) {
      router.push(url)
    }
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/dashboard">
                <ArrowUpCircleIcon className="h-5 w-5" />
                <span className="text-base font-semibold">R00Bee.</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain
          items={data.navMain.map(item => ({
            ...item,
            onClick: () => handleNavigation(item.url)
          }))} 
        />
        <NavDocuments 
          items={data.documents.map(item => ({
            ...item,
            onClick: () => handleNavigation(item.url)
          }))}
        />
        <NavSecondary 
          items={data.navSecondary.map(item => ({
            ...item,
            onClick: () => handleNavigation(item.url)
          }))}
          className="mt-auto" 
        />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}