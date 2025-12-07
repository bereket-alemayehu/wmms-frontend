# Project Structure & Tech Stack

## 📁 Folder Structure

```
wifi/
├── app/                          # Next.js App Router directory
│   ├── globals.css              # Global CSS styles
│   ├── layout.tsx               # Root layout component
│   └── page.tsx                 # Home page component
│
├── components/                   # React components
│   ├── ui/                      # shadcn/ui component library
│   │   ├── accordion.tsx
│   │   ├── alert-dialog.tsx
│   │   ├── alert.tsx
│   │   ├── aspect-ratio.tsx
│   │   ├── avatar.tsx
│   │   ├── badge.tsx
│   │   ├── breadcrumb.tsx
│   │   ├── button-group.tsx
│   │   ├── button.tsx
│   │   ├── calendar.tsx
│   │   ├── card.tsx
│   │   ├── carousel.tsx
│   │   ├── chart.tsx
│   │   ├── checkbox.tsx
│   │   ├── collapsible.tsx
│   │   ├── command.tsx
│   │   ├── context-menu.tsx
│   │   ├── dialog.tsx
│   │   ├── drawer.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── empty.tsx
│   │   ├── field.tsx
│   │   ├── form.tsx
│   │   ├── hover-card.tsx
│   │   ├── input-group.tsx
│   │   ├── input-otp.tsx
│   │   ├── input.tsx
│   │   ├── item.tsx
│   │   ├── kbd.tsx
│   │   ├── label.tsx
│   │   ├── menubar.tsx
│   │   ├── navigation-menu.tsx
│   │   ├── pagination.tsx
│   │   ├── popover.tsx
│   │   ├── progress.tsx
│   │   ├── radio-group.tsx
│   │   ├── resizable.tsx
│   │   ├── scroll-area.tsx
│   │   ├── select.tsx
│   │   ├── separator.tsx
│   │   ├── sheet.tsx
│   │   ├── sidebar.tsx
│   │   ├── skeleton.tsx
│   │   ├── slider.tsx
│   │   ├── sonner.tsx
│   │   ├── spinner.tsx
│   │   ├── switch.tsx
│   │   ├── table.tsx
│   │   ├── tabs.tsx
│   │   ├── textarea.tsx
│   │   ├── toast.tsx
│   │   ├── toaster.tsx
│   │   ├── toggle-group.tsx
│   │   ├── toggle.tsx
│   │   ├── tooltip.tsx
│   │   ├── use-mobile.tsx
│   │   └── use-toast.ts
│   │
│   ├── create-ticket-dialog.tsx  # Ticket creation dialog component
│   ├── customer-dashboard.tsx    # Customer dashboard view
│   ├── dashboard-layout.tsx      # Dashboard layout wrapper
│   ├── login-form.tsx            # Login form component
│   ├── manager-dashboard.tsx     # Manager dashboard view
│   ├── outage-card.tsx           # Outage information card
│   ├── stats-card.tsx            # Statistics display card
│   ├── supervisor-dashboard.tsx  # Supervisor dashboard view
│   ├── technician-dashboard.tsx  # Technician dashboard view
│   ├── theme-provider.tsx        # Theme context provider
│   └── ticket-card.tsx           # Ticket display card
│
├── hooks/                        # Custom React hooks
│   ├── use-mobile.ts            # Mobile detection hook
│   └── use-toast.ts             # Toast notification hook
│
├── lib/                          # Utility libraries and helpers
│   ├── auth-context.tsx         # Authentication context
│   ├── mock-data.ts             # Mock data for development
│   ├── types.ts                 # TypeScript type definitions
│   └── utils.ts                 # Utility functions
│
├── public/                       # Static assets
│   ├── apple-icon.png
│   ├── icon-dark-32x32.png
│   ├── icon-light-32x32.png
│   ├── icon.svg
│   ├── placeholder-logo.png
│   ├── placeholder-logo.svg
│   ├── placeholder-user.jpg
│   ├── placeholder.jpg
│   └── placeholder.svg
│
├── styles/                       # Additional stylesheets
│   └── globals.css              # Global CSS styles
│
├── components.json               # shadcn/ui configuration
├── next.config.mjs              # Next.js configuration
├── package.json                 # Node.js dependencies and scripts
├── pnpm-lock.yaml               # pnpm lock file
├── postcss.config.mjs           # PostCSS configuration
└── tsconfig.json                # TypeScript configuration
```

## 🛠️ Tech Stack

### Core Framework
- **Next.js** `16.0.7` - React framework with App Router
- **React** `19.2.0` - UI library
- **React DOM** `19.2.0` - React rendering

### Language & Type Safety
- **TypeScript** `^5` - Type-safe JavaScript
- **Zod** `3.25.76` - Schema validation library

### Styling
- **Tailwind CSS** `^4.1.9` - Utility-first CSS framework
- **PostCSS** `^8.5` - CSS processing tool
- **Autoprefixer** `^10.4.20` - CSS vendor prefixing
- **tailwindcss-animate** `^1.0.7` - Animation utilities
- **tw-animate-css** `1.3.3` - Additional Tailwind animations
- **next-themes** `^0.4.6` - Theme switching (dark/light mode)

### UI Component Library
- **shadcn/ui** - Component library built on Radix UI
- **Radix UI** - Headless UI primitives (multiple packages):
  - Accordion, Alert Dialog, Avatar, Checkbox, Collapsible
  - Context Menu, Dialog, Dropdown Menu, Hover Card
  - Label, Menubar, Navigation Menu, Popover
  - Progress, Radio Group, Scroll Area, Select
  - Separator, Slider, Switch, Tabs, Toast, Toggle, Tooltip
- **lucide-react** `^0.454.0` - Icon library

### Form Management
- **react-hook-form** `^7.60.0` - Form state management
- **@hookform/resolvers** `^3.10.0` - Form validation resolvers

### Additional Libraries
- **class-variance-authority** `^0.7.1` - Component variant management
- **clsx** `^2.1.1` - Conditional className utility
- **tailwind-merge** `^2.5.5` - Merge Tailwind classes intelligently
- **date-fns** `4.1.0` - Date utility library
- **react-day-picker** `9.8.0` - Date picker component
- **cmdk** `1.0.4` - Command menu component
- **embla-carousel-react** `8.5.1` - Carousel component
- **input-otp** `1.4.1` - OTP input component
- **react-resizable-panels** `^2.1.7` - Resizable panel layouts
- **recharts** `2.15.4` - Charting library
- **sonner** `^1.7.4` - Toast notification library
- **vaul** `^1.1.2` - Drawer component

### Analytics
- **@vercel/analytics** `latest` - Vercel analytics integration

### Package Manager
- **pnpm** - Fast, disk space efficient package manager

### Development Tools
- **ESLint** - Code linting
- **@types/node** `^22` - Node.js type definitions
- **@types/react** `^19` - React type definitions
- **@types/react-dom** `^19` - React DOM type definitions

## 🎨 Design System

- **Style**: New York (shadcn/ui style variant)
- **Base Color**: Neutral
- **CSS Variables**: Enabled
- **Icon Library**: Lucide React
- **Theme Support**: Dark/Light mode via next-themes

## 📦 Project Type

This appears to be a **WiFi/Network Management System** with role-based dashboards for:
- Customers
- Technicians
- Supervisors
- Managers

Features include:
- Ticket management system
- Outage tracking
- Statistics and analytics
- Authentication system
- Responsive design with mobile support

