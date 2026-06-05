"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { 
  FileText, 
  Shield, 
  Key, 
  UserCog, 
  Database, 
  Settings,
  CheckCircle,
  AlertTriangle,
  Info
} from "lucide-react"

export default function AdminInstructionsPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <FileText className="h-6 w-6 text-orange-500" />
        <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
          Admin Instructions
        </h1>
      </div>

      <div className="grid gap-6">
        {/* Overview Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-orange-500" />
              Admin Panel Overview
            </CardTitle>
            <CardDescription>
              Complete guide to managing your inventory system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              The Admin Panel provides comprehensive control over your inventory management system. 
              Access sensitive settings, manage user credentials, and configure system parameters.
            </p>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Available Features
                </h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Login Credentials Management</li>
                  <li>• Settings Access Code Control</li>
                  <li>• Product Management (Full CRUD)</li>
                  <li>• User Role Management</li>
                  <li>• System Configuration</li>
                  <li>• Database Management</li>
                  <li>• Security Settings</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  Security Requirements
                </h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Admin access code required</li>
                  <li>• Strong password policies</li>
                  <li>• Regular code updates</li>
                  <li>• Secure session management</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Access Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-orange-500" />
              How to Access Admin Panel
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">1</Badge>
                <div>
                  <h4 className="font-semibold">Click Settings Button</h4>
                  <p className="text-sm text-gray-600">
                    {`In the main sidebar, click the "Settings" button located above the "Logout" button.`}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">2</Badge>
                <div>
                  <h4 className="font-semibold">Enter Access Code</h4>
                  <p className="text-sm text-gray-600">
                    A modal will appear asking for your admin access code. Enter the current code to proceed.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">3</Badge>
                <div>
                  <h4 className="font-semibold">Access Admin Panel</h4>
                  <p className="text-sm text-gray-600">
                    Upon successful verification, you'll be redirected to the admin panel with additional navigation options.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Admin Navigation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-orange-500" />
              Admin Navigation Guide
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <UserCog className="h-5 w-5 text-blue-500 mt-1" />
                  <div>
                    <h4 className="font-semibold">Login Credentials</h4>
                    <p className="text-sm text-gray-600">
                      Manage admin username and password for system access.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Key className="h-5 w-5 text-green-500 mt-1" />
                  <div>
                    <h4 className="font-semibold">Settings Code</h4>
                    <p className="text-sm text-gray-600">
                      Update the access code required to enter admin settings.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Database className="h-5 w-5 text-purple-500 mt-1" />
                  <div>
                    <h4 className="font-semibold">Database</h4>
                    <p className="text-sm text-gray-600">
                      View and manage database connections and data.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Settings className="h-5 w-5 text-orange-500 mt-1" />
                  <div>
                    <h4 className="font-semibold">System Settings</h4>
                    <p className="text-sm text-gray-600">
                      Configure system-wide settings and preferences.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Default Codes */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Default Access Codes:</strong> For initial setup, use <code className="bg-gray-100 px-1 rounded">ADMIN123</code> or <code className="bg-gray-100 px-1 rounded">admin</code> to access the admin panel.
            Change these codes immediately after first login for security.
          </AlertDescription>
        </Alert>

        {/* Security Best Practices */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-orange-500" />
              Security Best Practices
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-semibold text-green-600">✓ Do's</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Use strong, unique passwords</li>
                  <li>• Change default access codes</li>
                  <li>• Regular security updates</li>
                  <li>• Monitor access logs</li>
                  <li>• Backup settings regularly</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-red-600">✗ Don&apos;t</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Share admin credentials</li>
                  <li>• Use weak passwords</li>
                  <li>• Leave sessions open</li>
                  <li>• Ignore security warnings</li>
                  <li>• Skip regular updates</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Roles & Permissions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCog className="h-5 w-5 text-orange-500" />
              User Roles & Permissions
            </CardTitle>
            <CardDescription>
              Understanding access levels across different user types
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              {/* Main Admin */}
              <div className="border-l-4 border-orange-500 pl-4">
                <h4 className="font-semibold text-orange-600 mb-2">Main Admin (You)</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>✓ Full system access and control</li>
                  <li>✓ Create, edit, delete products</li>
                  <li>✓ Manage inventory restocking</li>
                  <li>✓ Access to all admin settings</li>
                  <li>✓ User credential management</li>
                  <li>✓ Database configuration</li>
                  <li>✓ System-wide settings</li>
                </ul>
              </div>

              {/* Logistics Admin */}
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold text-blue-600 mb-2">Logistics/Warehouse Admin</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>✓ Full product management access</li>
                  <li>✓ Create, edit, delete products</li>
                  <li>✓ Manage inventory restocking</li>
                  <li>✓ Order tracking and dispatch</li>
                  <li>✓ Warehouse operations</li>
                  <li>✗ No access to admin settings</li>
                  <li>✗ Cannot manage credentials</li>
                </ul>
              </div>

              {/* Departments/Sales Teams */}
              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="font-semibold text-green-600 mb-2">Departments (Sales Teams)</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>✓ View product inventory (Read-only)</li>
                  <li>✓ Search and filter products</li>
                  <li>✓ View product details and pricing</li>
                  <li>✓ Create sales orders</li>
                  <li>✗ Cannot add/edit/delete products</li>
                  <li>✗ Cannot restock inventory</li>
                  <li>✗ No admin settings access</li>
                </ul>
              </div>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Product Management Access:</strong> Only Main Admin and Logistics Admin can manage products. 
                Departments have read-only access to ensure data integrity and proper inventory control.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Product Management Guide */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-orange-500" />
              Product Management Guide
            </CardTitle>
            <CardDescription>
              How to manage products in the inventory system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1 bg-blue-50">Add</Badge>
                <div>
                  <h4 className="font-semibold">Adding New Products</h4>
                  <p className="text-sm text-gray-600">
                    Click the "+ Product" button at the top of the Inventory page. Fill in product details including name, 
                    category, prices, and initial stock. Upload product image for better visibility.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1 bg-purple-50">Bundle</Badge>
                <div>
                  <h4 className="font-semibold">Creating Product Bundles</h4>
                  <p className="text-sm text-gray-600">
                    Click the "+ Bundle" button to create product bundles. Select multiple products and set quantities. 
                    Bundles automatically calculate pricing and manage stock of component items.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1 bg-orange-50">Edit</Badge>
                <div>
                  <h4 className="font-semibold">Editing Products</h4>
                  <p className="text-sm text-gray-600">
                    Click the edit icon (pencil) in the Actions column. Update product details as needed. 
                    <strong> Note:</strong> Quantity cannot be edited directly - use Restock function instead.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1 bg-green-50">Restock</Badge>
                <div>
                  <h4 className="font-semibold">Restocking Inventory</h4>
                  <p className="text-sm text-gray-600">
                    Click the restock icon (package plus) to add inventory. Enter the amount and reason for audit trail. 
                    This is the ONLY way to increase product quantity to maintain proper inventory tracking.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1 bg-red-50">Delete</Badge>
                <div>
                  <h4 className="font-semibold">Deleting Products</h4>
                  <p className="text-sm text-gray-600">
                    Click the delete icon (trash) in the Actions column. Confirm deletion when prompted. 
                    <strong> Warning:</strong> This action cannot be undone. Ensure no active orders reference the product.
                  </p>
                </div>
              </div>
            </div>

            <Alert className="bg-yellow-50 border-yellow-200">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                <strong>Important:</strong> Quantity validation is strictly enforced. You cannot edit product quantity 
                through the edit dialog. All stock increases must go through the Restock function to maintain proper 
                audit trails and inventory accuracy.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
