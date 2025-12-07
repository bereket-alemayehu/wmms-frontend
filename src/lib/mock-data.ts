import type { User, Office, Ticket, Refund, Outage } from "./types"

// Mock data for demonstration - in production, this would come from MongoDB

export const mockOffices: Office[] = [
  {
    _id: "office1",
    cityName: "Addis Ababa",
    branchName: "Bole Branch",
    location: "Bole, near Friendship Mall",
    activeTechniciansCount: 5,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    _id: "office2",
    cityName: "Addis Ababa",
    branchName: "Kazanchis Branch",
    location: "Kazanchis, near Hilton",
    activeTechniciansCount: 3,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
]

export const mockUsers: User[] = [
  {
    _id: "user1",
    fullName: "Abebe Kebede",
    phoneNumber: "+251911223344",
    role: "customer",
    serviceNumber: "SVC-001234",
    createdAt: "2024-01-15T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
  },
  {
    _id: "user2",
    fullName: "Sara Tesfaye",
    phoneNumber: "+251922334455",
    role: "supervisor",
    officeId: "office1",
    createdAt: "2024-01-10T00:00:00Z",
    updatedAt: "2024-01-10T00:00:00Z",
  },
  {
    _id: "user3",
    fullName: "Dawit Hailu",
    phoneNumber: "+251933445566",
    role: "technician",
    officeId: "office1",
    createdAt: "2024-01-12T00:00:00Z",
    updatedAt: "2024-01-12T00:00:00Z",
  },
  {
    _id: "user4",
    fullName: "Meron Alemu",
    phoneNumber: "+251944556677",
    role: "manager",
    createdAt: "2024-01-05T00:00:00Z",
    updatedAt: "2024-01-05T00:00:00Z",
  },
  {
    _id: "user5",
    fullName: "Yonas Bekele",
    phoneNumber: "+251955667788",
    role: "technician",
    officeId: "office1",
    createdAt: "2024-01-14T00:00:00Z",
    updatedAt: "2024-01-14T00:00:00Z",
  },
]

export const mockTickets: Ticket[] = [
  {
    _id: "ticket1",
    customerId: "user1",
    officeId: "office1",
    category: "No Connection",
    description: "Internet has been down for 2 days. Router lights are blinking red.",
    status: "Pending",
    refundEligible: false,
    refundRequested: false,
    createdAt: "2024-12-01T10:00:00Z",
    updatedAt: "2024-12-01T10:00:00Z",
  },
  {
    _id: "ticket2",
    customerId: "user1",
    officeId: "office1",
    category: "Speed Issue",
    description: "Getting only 5 Mbps instead of promised 50 Mbps.",
    status: "Assigned",
    assignedTo: "user3",
    refundEligible: false,
    refundRequested: false,
    createdAt: "2024-11-25T14:30:00Z",
    updatedAt: "2024-11-26T09:00:00Z",
  },
  {
    _id: "ticket3",
    customerId: "user1",
    officeId: "office1",
    category: "Hardware Fault",
    description: "Router keeps restarting every few hours.",
    status: "In Progress",
    assignedTo: "user5",
    refundEligible: true,
    refundRequested: false,
    createdAt: "2024-11-20T08:00:00Z",
    updatedAt: "2024-11-28T16:00:00Z",
  },
  {
    _id: "ticket4",
    customerId: "user1",
    officeId: "office1",
    category: "No Connection",
    description: "Complete outage after the storm last week.",
    status: "Resolved",
    assignedTo: "user3",
    refundEligible: true,
    refundRequested: true,
    rating: 4,
    feedbackComment: "Quick resolution, thank you!",
    createdAt: "2024-11-10T12:00:00Z",
    updatedAt: "2024-11-18T10:00:00Z",
  },
]

export const mockRefunds: Refund[] = [
  {
    _id: "refund1",
    ticketId: "ticket4",
    customerId: "user1",
    amount: 250,
    status: "Approved",
    adminComment: "Approved due to extended downtime exceeding 7 days.",
    createdAt: "2024-11-18T11:00:00Z",
    updatedAt: "2024-11-19T09:00:00Z",
  },
  {
    _id: "refund2",
    ticketId: "ticket3",
    customerId: "user1",
    amount: 180,
    status: "Requested",
    createdAt: "2024-12-01T08:00:00Z",
    updatedAt: "2024-12-01T08:00:00Z",
  },
]

export const mockOutages: Outage[] = [
  {
    _id: "outage1",
    officeId: "office1",
    postedBy: "user2",
    title: "Fiber Cut in Bole Area",
    message:
      "A fiber optic cable was accidentally cut during road construction. Our team is working to restore service.",
    affectedAreas: ["Bole", "Gerji", "CMC"],
    status: "Active",
    estimatedResolution: "2024-12-03T18:00:00Z",
    createdAt: "2024-12-02T06:00:00Z",
    updatedAt: "2024-12-02T06:00:00Z",
  },
  {
    _id: "outage2",
    officeId: "office1",
    postedBy: "user2",
    title: "Scheduled Maintenance",
    message: "Scheduled network upgrade. Expect brief interruptions.",
    affectedAreas: ["Kazanchis", "Piassa"],
    status: "Resolved",
    createdAt: "2024-11-28T00:00:00Z",
    updatedAt: "2024-11-28T06:00:00Z",
  },
]

// Helper functions
export const checkRefundEligibility = (ticket: Ticket): boolean => {
  const ONE_DAY = 24 * 60 * 60 * 1000
  const now = new Date()
  const created = new Date(ticket.createdAt)
  const diffDays = Math.round(Math.abs((now.getTime() - created.getTime()) / ONE_DAY))
  return diffDays > 7 && ticket.status !== "Closed"
}

export const getQueuePosition = (ticketId: string, officeId: string): number => {
  const ticket = mockTickets.find((t) => t._id === ticketId)
  if (!ticket) return 0

  const position = mockTickets.filter(
    (t) =>
      t.officeId === officeId &&
      ["Pending", "Assigned"].includes(t.status) &&
      new Date(t.createdAt) < new Date(ticket.createdAt),
  ).length

  return position + 1
}

