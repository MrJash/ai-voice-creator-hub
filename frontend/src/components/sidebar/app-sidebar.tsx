
"use server";

import { UserButton } from "@daveyplate/better-auth-ui";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
} from "../ui/sidebar";
import { User, Settings } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import SidebarMenuItems from "./sidebar-menu-items";
import MobileSidebarClose from "./mobile-sidebar-close";
import Credits from "./credits";
import Upgrade from "./upgrade";

export default async function AppSidebar() {
  return (
    <Sidebar className="border-r border-border/40">
      <SidebarContent className="px-4">
        <MobileSidebarClose />

        {/* Brand */}
        <div className="mt-6 mb-1 px-2">
          <Link href="/" className="group flex items-center gap-3">
            <div className="relative">
              <div className="absolute -inset-1 rounded-xl bg-primary/15 blur-md transition-all duration-500 group-hover:bg-primary/25 group-hover:blur-lg" />
              <Image
                src="/logo.png"
                alt="AI Voice Creator Hub"
                width={36}
                height={36}
                className="relative h-9 w-9 drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-[15px] font-bold leading-tight tracking-tight text-foreground">
                AI Voice
              </span>
              <span className="text-[10px] font-semibold uppercase leading-tight tracking-[0.2em] text-muted-foreground/60">
                Creator Hub
              </span>
            </div>
          </Link>

          {/* Audio-wave separator */}
          <div className="mt-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-gradient-to-r from-border/80 to-transparent" />
            <div className="flex items-end gap-[3px]">
              <div className="h-1.5 w-[3px] rounded-full bg-primary/30" />
              <div className="h-2.5 w-[3px] rounded-full bg-primary/50" />
              <div className="h-3.5 w-[3px] rounded-full bg-primary/70" />
              <div className="h-2.5 w-[3px] rounded-full bg-primary/50" />
              <div className="h-1.5 w-[3px] rounded-full bg-primary/30" />
            </div>
            <div className="h-px flex-1 bg-gradient-to-l from-border/80 to-transparent" />
          </div>
        </div>

        {/* Navigation */}
        <SidebarGroup className="mt-3">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/50">
            Menu
          </p>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5">
              <SidebarMenuItems />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/40 p-4">
        {/* Credits & Upgrade card */}
        <div className="mb-3 rounded-xl border border-border/50 bg-muted/20 px-3 py-2.5 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <Credits />
            <Upgrade />
          </div>
        </div>
        <UserButton
          variant="outline"
          className="border-border/50 hover:border-primary/30 hover:bg-muted/50 w-full transition-all duration-200"
          disableDefaultLinks={true}
          additionalLinks={[
            {
              label: "Customer Portal",
              href: "/dashboard/customer-portal",
              icon: <User className="h-4 w-4" />,
            },
            {
              label: "Settings",
              href: "/dashboard/settings",
              icon: <Settings className="h-4 w-4" />,
            },
          ]}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
