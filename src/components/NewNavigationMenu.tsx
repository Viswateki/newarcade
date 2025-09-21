"use client"

import * as React from "react"
import Link from "next/link"
import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/contexts/AuthContext'
import ThemeToggle from './ThemeToggle'
import UserAccountDropdown from './UserAccountDropdown'
import ImprovedUserDropdown from './ImprovedUserDropdown'
import { 
  Home, 
  LayoutDashboard, 
  FileText, 
  Wrench, 
  Plus, 
  TrendingUp,
  User,
  LogOut,
  Settings,
  BookOpen,
  Lightbulb,
  ChevronDown
} from "lucide-react"

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"

const ListItem = React.memo(React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a"> & { title: string; description?: string }
>(({ className, title, children, ...props }, ref) => {
  const { colors } = useTheme()
  
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={`
            block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none 
            transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground
            ${className}
          `}
          style={{
            color: colors.foreground,
            backgroundColor: colors.card,
          }}
          {...props}
        >
          <div className="text-sm font-medium leading-none" style={{ color: colors.foreground }}>
            {title}
          </div>
          {children && (
            <div className="line-clamp-2 text-sm leading-snug" style={{ color: colors.foreground, opacity: 0.7 }}>
              {children}
            </div>
          )}
        </a>
      </NavigationMenuLink>
    </li>
  )
}))
ListItem.displayName = "ListItem"

export function NewNavigationMenu() {
  const { theme, colors } = useTheme()
  const { user, loading } = useAuth()

  // Show loading skeleton while checking auth
  if (loading) {
    return (
      <div className="flex items-center w-full px-4 py-4 bg-transparent">
        <div className="flex items-center space-x-4">
          <div className="h-8 w-20 bg-gray-200/20 dark:bg-gray-700/20 rounded-md animate-pulse"></div>
          <div className="h-8 w-8 bg-gray-200/20 dark:bg-gray-700/20 rounded-md animate-pulse"></div>
        </div>
        <div className="flex-1 flex justify-center">
          <div className="h-8 w-48 bg-gray-200/20 dark:bg-gray-700/20 rounded-md animate-pulse"></div>
        </div>
        <div className="h-8 w-16 bg-gray-200/20 dark:bg-gray-700/20 rounded-md animate-pulse"></div>
      </div>
    )
  }

  return (
      <div className="flex items-center w-full px-4 py-4 bg-transparent" style={{ overflow: 'visible' }}>
        {/* Logo on the left */}
        <div className="flex items-center space-x-4">
          <Link href="/" className="cursor-pointer hover:opacity-80 transition-opacity duration-300 relative z-50">
            <span className="text-lg font-bold px-3 py-2 rounded-lg">
              <span className="text-cyan-500">ai</span>
              <span 
                className="transition-colors duration-300"
                style={{
                  color: theme === 'dark' ? '#ffffff' : '#1e293b'
                }}
              >
                arcade
              </span>
            </span>
          </Link>
          <div className="rounded-lg">
            <ThemeToggle />
          </div>
        </div>
        
        {/* Centered navigation menu */}
        <div className="flex-1 flex justify-center">
          <div className="rounded-lg px-4 py-2" style={{ overflow: 'visible' }}>
            <NavigationMenu>
              <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger 
                  className="transition-colors duration-300 hover:bg-black/10 dark:hover:bg-white/10"
                  style={{
                    color: theme === 'dark' ? '#ffffff' : '#1e293b'
                  }}
                >
                  Discover
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul 
                    className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]"
                    style={{ backgroundColor: colors.card }}
                  >
                    <li className="row-span-3">
                      <NavigationMenuLink asChild>
                        <a
                          className="flex h-full w-full select-none flex-col justify-end rounded-md p-6 no-underline outline-none focus:shadow-md"
                          style={{
                            background: `linear-gradient(to bottom, ${colors.muted}, ${colors.card})`,
                            color: colors.foreground
                          }}
                          href="/"
                        >
                          <div className="mb-2 mt-4 text-lg font-medium" style={{ color: colors.foreground }}>
                            AIArcade
                          </div>
                          <p className="text-sm leading-tight" style={{ color: colors.foreground, opacity: 0.7 }}>
                            Discover amazing AI tools and resources.
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </li>
                    <ListItem href="/blogs" title="All Blogs">
                      Browse community blogs and tutorials
                    </ListItem>
                    <ListItem href="/tools" title="AI Tools">
                      Find AI tools to boost your productivity
                    </ListItem>
                    <ListItem href="/learn" title="Learn">
                      Educational content and guides
                    </ListItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <NavigationMenuTrigger 
                  className="transition-colors duration-300 hover:bg-black/10 dark:hover:bg-white/10"
                  style={{
                    color: theme === 'dark' ? '#ffffff' : '#1e293b'
                  }}
                >
                  Community
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul 
                    className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]"
                    style={{ backgroundColor: colors.card }}
                  >
                    <ListItem href="/blogs?sort=trending" title="Trending">
                      See what's popular in the community
                    </ListItem>
                    <ListItem href="/blogs?featured=true" title="Featured">
                      Hand-picked quality content
                    </ListItem>
                    <ListItem href="#" title="Discord">
                      Join our community discussions
                    </ListItem>
                    <ListItem href="#" title="Case Studies">
                      Real-world project examples
                    </ListItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <NavigationMenuTrigger 
                  className="transition-colors duration-300 hover:bg-black/10 dark:hover:bg-white/10"
                  style={{
                    color: theme === 'dark' ? '#ffffff' : '#1e293b'
                  }}
                >
                  Share Your Ideas
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul 
                    className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]"
                    style={{ backgroundColor: colors.card }}
                  >
                    <ListItem href="/create-blog" title="Write Blog">
                      Share your knowledge and insights
                    </ListItem>
                    <ListItem href="/submit-tool" title="Submit Tool">
                      Add an AI tool to our collection
                    </ListItem>
                    <ListItem href="#" title="Quick Tips">
                      Share quick insights and tips
                    </ListItem>
                    <ListItem href="#" title="Resources">
                      Share helpful resources
                    </ListItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>
        
        {/* Right side - Use improved UserAccountDropdown */}
        <div className="flex items-center space-x-2">
          {user ? (
            // Show improved user account dropdown for authenticated users
            <ImprovedUserDropdown />
          ) : (
            // Public user - show Sign In button
            <div className="rounded-lg px-4 py-2">
              <NavigationMenu>
                <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link 
                      href="/login"
                      className="group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none disabled:pointer-events-none disabled:opacity-50 hover:bg-black/10 dark:hover:bg-white/10"
                      style={{
                        color: theme === 'dark' ? '#ffffff' : '#1e293b'
                      }}
                    >
                      Sign In
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          )}
        </div>
      </div>
    )
}
