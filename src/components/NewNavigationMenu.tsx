"use client"

import * as React from "react"
import Link from "next/link"
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import ThemeToggle from './ThemeToggle'
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
  Lightbulb
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
  const { user, logout } = useAuth()
  const { theme, colors } = useTheme()

  const handleLogout = React.useCallback(async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }, [logout])

  if (!user) {
    // Public navigation for non-authenticated users
    return (
      <div className="flex items-center w-full px-4 py-4 bg-transparent">
        {/* Logo on the left */}
        <div className="flex items-center space-x-4">
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
          <div className="rounded-lg">
            <ThemeToggle />
          </div>
        </div>
        
        {/* Centered navigation menu */}
        <div className="flex-1 flex justify-center">
          <div className="rounded-lg px-4 py-2">
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
                  <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
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
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
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
                  Share Ur Ideas
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
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
        
        {/* Sign In button on the right */}
        <div className="flex items-center space-x-2">
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
        </div>
      </div>
    )
  }

  // Authenticated navigation for logged-in users
  return (
    <div className="flex items-center w-full px-4 py-4 bg-transparent">
      {/* Logo on the left */}
      <div className="flex items-center space-x-4">
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
        <div className="rounded-lg">
          <ThemeToggle />
        </div>
      </div>
      
      {/* Centered navigation menu */}
      <div className="flex-1 flex justify-center">
        <div className="rounded-lg px-4 py-2">
          <NavigationMenu>
            <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger 
                className="transition-colors duration-300 hover:bg-black/10 dark:hover:bg-white/10"
                style={{
                  color: theme === 'dark' ? '#ffffff' : '#1e293b'
                }}
              >
                Workspace
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                  <li className="row-span-3">
                    <NavigationMenuLink asChild>
                      <a
                        className="flex h-full w-full select-none flex-col justify-end rounded-md p-6 no-underline outline-none focus:shadow-md"
                        style={{
                          background: `linear-gradient(to bottom, ${colors.muted}, ${colors.card})`,
                          color: colors.foreground
                        }}
                        href="/dashboard"
                      >
                        <div className="mb-2 mt-4 text-lg font-medium" style={{ color: colors.foreground }}>
                          Your Dashboard
                        </div>
                        <p className="text-sm leading-tight" style={{ color: colors.foreground, opacity: 0.7 }}>
                          Manage your content and track your progress.
                        </p>
                      </a>
                    </NavigationMenuLink>
                  </li>
                  <ListItem href="/dashboard" title="Dashboard">
                    <div className="flex items-center space-x-2">
                      <LayoutDashboard className="h-4 w-4" />
                      <span>Overview and analytics</span>
                    </div>
                  </ListItem>
                  <ListItem href="/blogs?author=me" title="My Blogs">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4" />
                      <span>Your published content</span>
                    </div>
                  </ListItem>
                  <ListItem href="/dashboard#analytics" title="Analytics">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4" />
                      <span>Content performance</span>
                    </div>
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
                Create
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                  <ListItem href="/create-blog" title="Write Blog">
                    <div className="flex items-center space-x-2">
                      <Plus className="h-4 w-4" />
                      <span>Share your knowledge</span>
                    </div>
                  </ListItem>
                  <ListItem href="/submit-tool" title="Submit Tool">
                    <div className="flex items-center space-x-2">
                      <Wrench className="h-4 w-4" />
                      <span>Add an AI tool</span>
                    </div>
                  </ListItem>
                  <ListItem href="/submit-tool" title="Share Resource">
                    <div className="flex items-center space-x-2">
                      <BookOpen className="h-4 w-4" />
                      <span>Helpful resources</span>
                    </div>
                  </ListItem>
                  <ListItem href="#" title="Quick Tips">
                    <div className="flex items-center space-x-2">
                      <Lightbulb className="h-4 w-4" />
                      <span>Share quick insights</span>
                    </div>
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
                Discover
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                  <ListItem href="/blogs" title="All Blogs">
                    Browse community content
                  </ListItem>
                  <ListItem href="/tools" title="AI Tools">
                    AI tools and utilities
                  </ListItem>
                  <ListItem href="/blogs?sort=trending" title="Trending">
                    Popular content
                  </ListItem>
                  <ListItem href="/learn" title="Learn">
                    Educational resources
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
                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
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
                Share Ur Ideas
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
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
      
      {/* Account menu on the right */}
      <div className="flex items-center">
        <div className="rounded-lg px-4 py-2">
          <NavigationMenu>
            <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger 
                className="transition-colors duration-300 hover:bg-black/10 dark:hover:bg-white/10"
                style={{
                  color: theme === 'dark' ? '#ffffff' : '#1e293b'
                }}
              >
                Account
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[200px] gap-3 p-4">
                  <ListItem href="/dashboard" title="Profile">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>View profile</span>
                    </div>
                  </ListItem>
                  <ListItem href="#" title="Settings">
                    <div className="flex items-center space-x-2">
                      <Settings className="h-4 w-4" />
                      <span>Account settings</span>
                    </div>
                  </ListItem>
                  <ListItem href="#" title="Sign Out" onClick={handleLogout}>
                    <div className="flex items-center space-x-2">
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </div>
                  </ListItem>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </div>
    </div>
  )
}
