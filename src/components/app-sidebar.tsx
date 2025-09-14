"use client"

import * as React from "react"
import { useState } from "react"
import {
  BarChart3,
  BookOpen,
  FileText,
  Settings,
  Wrench,
  User2,
  ChevronDown,
  ChevronRight,
  Star,
  Users,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { useAuth } from "@/contexts/AuthContext"

// TypeScript interfaces
interface SubItem {
  title: string;
  url: string;
}

interface NavigationItem {
  title: string;
  url?: string;
  icon?: React.ComponentType<{ className?: string }>;
  isExpandable?: boolean;
  subItems?: SubItem[];
}

interface NavigationData {
  main: NavigationItem[];
  secondary: NavigationItem[];
}

// Navigation items matching the design
const navigationData: NavigationData = {
  main: [
    {
      title: "Analytics",
      url: "/dashboard/analytics",
      icon: BarChart3,
    },
    {
      title: "tools",
      icon: Wrench,
      isExpandable: true,
      subItems: [
        {
          title: "Favorite tools",
          url: "/tools/favorites",
        },
        {
          title: "Your tools",
          url: "/tools/yours",
        },
      ],
    },
    {
      title: "My Blogs",
      url: "/blogs",
      icon: FileText,
    },
    {
      title: "Learn",
      icon: BookOpen,
      isExpandable: true,
      subItems: [
        {
          title: "how to create your tool",
          url: "/learn/create-tool",
        },
        {
          title: "how to deploy Your tool",
          url: "/learn/deploy-tool",
        },
        {
          title: "How to submit tools",
          url: "/learn/submit-tools",
        },
      ],
    },
  ],
  secondary: [
    {
      title: "Profile",
      url: "/dashboard/profile",
      icon: User2,
    },
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: Settings,
    },
  ],
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  onNavigate?: (route: string) => void;
}

export function AppSidebar({ onNavigate, ...props }: AppSidebarProps) {
  const { user } = useAuth();
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const toggleSection = (sectionTitle: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionTitle)
        ? prev.filter(title => title !== sectionTitle)
        : [...prev, sectionTitle]
    );
  };

  const handleNavigation = (url: string) => {
    if (onNavigate) {
      // Extract the route from the URL for internal navigation
      const route = url.replace('/dashboard/', '').replace('/', '');
      onNavigate(route || 'dashboard');
    }
  };

  const renderIcon = (IconComponent?: React.ComponentType<{ className?: string }>) => {
    if (!IconComponent) return null;
    return <IconComponent className="size-4" />;
  };

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader className="p-4">
        {/* Back button */}
        <SidebarMenuButton size="sm" className="mb-4 justify-start" asChild>
          <a href="/" className="flex items-center gap-2">
            <ArrowLeft className="size-4" />
            <span>Back to Home</span>
          </a>
        </SidebarMenuButton>
      </SidebarHeader>

      <SidebarContent className="px-4">
        {/* Main navigation items */}
        <SidebarGroup>
          <SidebarMenu>
            {navigationData.main.map((item) => (
              <div key={item.title}>
                <SidebarMenuItem>
                  {item.isExpandable ? (
                    <SidebarMenuButton
                      onClick={() => toggleSection(item.title)}
                      className="w-full justify-between"
                    >
                      <div className="flex items-center gap-2">
                        {renderIcon(item.icon)}
                        <span className="capitalize">{item.title}</span>
                      </div>
                      {expandedSections.includes(item.title) ? (
                        <ChevronDown className="size-4" />
                      ) : (
                        <ChevronRight className="size-4" />
                      )}
                    </SidebarMenuButton>
                  ) : (
                    <SidebarMenuButton 
                      onClick={() => item.url && handleNavigation(item.url)}
                      className="cursor-pointer"
                    >
                      {renderIcon(item.icon)}
                      <span className="capitalize">{item.title}</span>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>

                {/* Submenu items */}
                {item.isExpandable && expandedSections.includes(item.title) && (
                  <div className="ml-6 mt-1 space-y-1">
                    {item.subItems?.map((subItem) => (
                      <SidebarMenuItem key={subItem.title}>
                        <SidebarMenuButton 
                          onClick={() => handleNavigation(subItem.url)}
                          size="sm"
                          className="cursor-pointer"
                        >
                          <span className="text-sm text-muted-foreground">
                            {subItem.title}
                          </span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        {/* Secondary navigation */}
        <SidebarGroup className="mt-8">
          <SidebarMenu>
            {navigationData.secondary.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton 
                  onClick={() => item.url && handleNavigation(item.url)}
                  className="cursor-pointer"
                >
                  {renderIcon(item.icon)}
                  <span className="capitalize">{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        {/* User profile section */}
        {user && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white text-sm font-medium">
              T
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium truncate">
                Teki Viswagna
              </span>
              <span className="text-xs text-muted-foreground truncate">
                tekiviswagna@gmail.com
              </span>
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}