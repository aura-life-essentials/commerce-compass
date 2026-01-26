import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useAllOrders,
  useOrderStats,
  useUpdateOrderStatus,
} from "@/hooks/useOrders";
import {
  useBusinessContacts,
  useWholesaleDeals,
  useWholesaleStats,
} from "@/hooks/useWholesale";
import {
  Users,
  DollarSign,
  Package,
  TrendingUp,
  Building2,
  Handshake,
  Search,
  Filter,
  Mail,
  Phone,
  Globe,
  MoreHorizontal,
} from "lucide-react";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const statusColors: Record<string, string> = {
  lead: "bg-blue-500/20 text-blue-400",
  qualified: "bg-yellow-500/20 text-yellow-400",
  negotiating: "bg-purple-500/20 text-purple-400",
  customer: "bg-green-500/20 text-green-400",
  churned: "bg-red-500/20 text-red-400",
  prospecting: "bg-gray-500/20 text-gray-400",
  proposal: "bg-orange-500/20 text-orange-400",
  closed_won: "bg-green-500/20 text-green-400",
  closed_lost: "bg-red-500/20 text-red-400",
};

export function CRMDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("orders");

  const { data: orders, isLoading: ordersLoading } = useAllOrders();
  const { data: orderStats } = useOrderStats();
  const { data: contacts } = useBusinessContacts();
  const { data: deals } = useWholesaleDeals();
  const { data: wholesaleStats } = useWholesaleStats();
  const updateOrder = useUpdateOrderStatus();

  const filteredOrders = orders?.filter(
    (o) =>
      o.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredContacts = contacts?.filter(
    (c) =>
      c.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDeals = deals?.filter(
    (d) =>
      d.deal_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Enterprise CRM</h2>
          <p className="text-muted-foreground">
            Manage customers, orders, and B2B deals
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="pl-10 w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-blue-400 mb-2">
              <Package className="w-4 h-4" />
              <span className="text-sm">Total Orders</span>
            </div>
            <p className="text-2xl font-bold">{orderStats?.totalOrders || 0}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-green-400 mb-2">
              <DollarSign className="w-4 h-4" />
              <span className="text-sm">Revenue</span>
            </div>
            <p className="text-2xl font-bold">
              ${(orderStats?.totalRevenue || 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-yellow-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-yellow-400 mb-2">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">Today</span>
            </div>
            <p className="text-2xl font-bold">
              ${(orderStats?.todayRevenue || 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-purple-400 mb-2">
              <Building2 className="w-4 h-4" />
              <span className="text-sm">B2B Contacts</span>
            </div>
            <p className="text-2xl font-bold">
              {wholesaleStats?.totalContacts || 0}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-orange-400 mb-2">
              <Handshake className="w-4 h-4" />
              <span className="text-sm">Pipeline</span>
            </div>
            <p className="text-2xl font-bold">
              ${(wholesaleStats?.pipelineValue || 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-emerald-400 mb-2">
              <Users className="w-4 h-4" />
              <span className="text-sm">Closed Deals</span>
            </div>
            <p className="text-2xl font-bold">
              ${(wholesaleStats?.closedWonValue || 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="contacts">B2B Contacts</TabsTrigger>
          <TabsTrigger value="deals">Wholesale Deals</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders?.slice(0, 20).map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-sm">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{order.customer_name || "Guest"}</p>
                          <p className="text-sm text-muted-foreground">
                            {order.customer_email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {(order.items as any[])?.length || 0} items
                      </TableCell>
                      <TableCell className="font-semibold">
                        ${Number(order.total_amount).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[order.status] || "bg-gray-500/20"}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(order.created_at), "MMM d, h:mm a")}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                updateOrder.mutate({
                                  orderId: order.id,
                                  status: "processing",
                                })
                              }
                            >
                              Mark Processing
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                updateOrder.mutate({
                                  orderId: order.id,
                                  status: "shipped",
                                  fulfillment_status: "fulfilled",
                                })
                              }
                            >
                              Mark Shipped
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                updateOrder.mutate({
                                  orderId: order.id,
                                  status: "completed",
                                })
                              }
                            >
                              Mark Completed
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contacts" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Industry</TableHead>
                    <TableHead>Lead Score</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContacts?.map((contact) => (
                    <TableRow key={contact.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{contact.company_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p>{contact.contact_name || "-"}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            {contact.email && (
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {contact.email}
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{contact.industry || "-"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-8 h-2 rounded-full ${
                              contact.lead_score >= 80
                                ? "bg-green-500"
                                : contact.lead_score >= 50
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                          />
                          <span>{contact.lead_score}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[contact.status] || "bg-gray-500/20"}>
                          {contact.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {contact.assigned_agent || "Unassigned"}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!filteredContacts || filteredContacts.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No B2B contacts yet. Agents are prospecting worldwide...
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deals" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Deal Name</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead>Probability</TableHead>
                    <TableHead>Expected Close</TableHead>
                    <TableHead>Agent</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDeals?.map((deal) => (
                    <TableRow key={deal.id}>
                      <TableCell className="font-medium">{deal.deal_name}</TableCell>
                      <TableCell className="font-semibold text-green-400">
                        ${Number(deal.deal_value).toLocaleString()}
                      </TableCell>
                      <TableCell>{deal.quantity_total} units</TableCell>
                      <TableCell>
                        <Badge className={statusColors[deal.stage] || "bg-gray-500/20"}>
                          {deal.stage.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary"
                              style={{ width: `${deal.probability}%` }}
                            />
                          </div>
                          <span className="text-sm">{deal.probability}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {deal.expected_close_date
                          ? format(new Date(deal.expected_close_date), "MMM d, yyyy")
                          : "-"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {deal.assigned_agent || "Autonomous"}
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!filteredDeals || filteredDeals.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No wholesale deals yet. Agents are negotiating globally...
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
