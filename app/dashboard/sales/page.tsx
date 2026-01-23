'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, BarChart3, TrendingUp, DollarSign, Package, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface SalesData {
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  profitMargin: number;
  totalOrders: number;
  dailySales: Array<{
    date: string;
    revenue: number;
    itemsSold: number;
    profit: number;
  }>;
  monthlySales: Array<{
    month: string;
    revenue: number;
    itemsSold: number;
    profit: number;
  }>;
}

export default function SalesAnalyticsPage() {
  const [viewMode, setViewMode] = useState<'daily' | 'monthly'>('daily');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [salesData, setSalesData] = useState<SalesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSalesData();
  }, [currentMonth]);

  const fetchSalesData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/reports');
      if (!response.ok) {
        throw new Error('Failed to fetch sales data');
      }
      const data = await response.json();
      setSalesData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={fetchSalesData}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!salesData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>No data available</p>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  // Calculate profit margin to ensure accuracy
  const calculatedProfitMargin = salesData.totalRevenue > 0 ? salesData.totalProfit / salesData.totalRevenue : 0;

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden">
      {/* Page Header */}
      <div className="mb-8 animate-in fade-in-0 slide-in-from-top-4 duration-700">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
          Sales Analytics
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-base">
          Track your sales performance and trends
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div></div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant={viewMode === 'daily' ? 'default' : 'outline'}
            onClick={() => setViewMode('daily')}
            className="flex items-center gap-2 flex-1 sm:flex-initial bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
          >
            <Calendar className="h-4 w-4" />
            Daily View
          </Button>
          <Button
            variant={viewMode === 'monthly' ? 'default' : 'outline'}
            onClick={() => setViewMode('monthly')}
            className="flex items-center gap-2 flex-1 sm:flex-initial bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
          >
            <BarChart3 className="h-4 w-4" />
            Monthly View
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-100">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 text-white shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-50">Total Orders</CardTitle>
            <Package className="h-5 w-5 text-white opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{salesData.totalOrders}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 border-0 text-white shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-50">Total Revenue</CardTitle>
            <DollarSign className="h-5 w-5 text-white opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(salesData.totalRevenue)}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 border-0 text-white shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-50">Total Cost</CardTitle>
            <Package className="h-5 w-5 text-white opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(salesData.totalCost)}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 border-0 text-white shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-50">Total Profit</CardTitle>
            <TrendingUp className="h-5 w-5 text-white opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(salesData.totalProfit)}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-pink-500 to-pink-600 border-0 text-white shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-pink-50">Profit Margin</CardTitle>
            <Users className="h-5 w-5 text-white opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatPercentage(calculatedProfitMargin)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      {viewMode === 'daily' ? (
        <Card className="border-0 shadow-lg bg-white dark:bg-slate-900 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-slate-900 dark:text-white">Daily Sales Calendar</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                  Previous
                </Button>
                <Badge variant="secondary">
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </Badge>
                <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                  Next
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 31 }, (_, i) => {
                const day = i + 1;
                const dayData = salesData.dailySales?.find(d => {
                  const date = new Date(d.date);
                  return date.getDate() === day && date.getMonth() === currentMonth.getMonth() && date.getFullYear() === currentMonth.getFullYear();
                });

                return (
                  <div
                    key={day}
                    className="aspect-square border rounded-lg p-2 flex flex-col items-center justify-center hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="text-sm font-medium">{day}</div>
                    {dayData && (
                      <div className="text-xs text-green-600 font-medium">
                        {formatCurrency(dayData.revenue)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-0 shadow-lg bg-white dark:bg-slate-900 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-200">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white">Monthly Sales Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={[
                { month: 'Jan', revenue: salesData.monthlySales?.find(d => d.month.endsWith('-01'))?.revenue || 0, itemsSold: salesData.monthlySales?.find(d => d.month.endsWith('-01'))?.itemsSold || 0, profit: salesData.monthlySales?.find(d => d.month.endsWith('-01'))?.profit || 0 },
                { month: 'Feb', revenue: salesData.monthlySales?.find(d => d.month.endsWith('-02'))?.revenue || 0, itemsSold: salesData.monthlySales?.find(d => d.month.endsWith('-02'))?.itemsSold || 0, profit: salesData.monthlySales?.find(d => d.month.endsWith('-02'))?.profit || 0 },
                { month: 'Mar', revenue: salesData.monthlySales?.find(d => d.month.endsWith('-03'))?.revenue || 0, itemsSold: salesData.monthlySales?.find(d => d.month.endsWith('-03'))?.itemsSold || 0, profit: salesData.monthlySales?.find(d => d.month.endsWith('-03'))?.profit || 0 },
                { month: 'Apr', revenue: salesData.monthlySales?.find(d => d.month.endsWith('-04'))?.revenue || 0, itemsSold: salesData.monthlySales?.find(d => d.month.endsWith('-04'))?.itemsSold || 0, profit: salesData.monthlySales?.find(d => d.month.endsWith('-04'))?.profit || 0 },
                { month: 'May', revenue: salesData.monthlySales?.find(d => d.month.endsWith('-05'))?.revenue || 0, itemsSold: salesData.monthlySales?.find(d => d.month.endsWith('-05'))?.itemsSold || 0, profit: salesData.monthlySales?.find(d => d.month.endsWith('-05'))?.profit || 0 },
                { month: 'Jun', revenue: salesData.monthlySales?.find(d => d.month.endsWith('-06'))?.revenue || 0, itemsSold: salesData.monthlySales?.find(d => d.month.endsWith('-06'))?.itemsSold || 0, profit: salesData.monthlySales?.find(d => d.month.endsWith('-06'))?.profit || 0 },
                { month: 'Jul', revenue: salesData.monthlySales?.find(d => d.month.endsWith('-07'))?.revenue || 0, itemsSold: salesData.monthlySales?.find(d => d.month.endsWith('-07'))?.itemsSold || 0, profit: salesData.monthlySales?.find(d => d.month.endsWith('-07'))?.profit || 0 },
                { month: 'Aug', revenue: salesData.monthlySales?.find(d => d.month.endsWith('-08'))?.revenue || 0, itemsSold: salesData.monthlySales?.find(d => d.month.endsWith('-08'))?.itemsSold || 0, profit: salesData.monthlySales?.find(d => d.month.endsWith('-08'))?.profit || 0 },
                { month: 'Sep', revenue: salesData.monthlySales?.find(d => d.month.endsWith('-09'))?.revenue || 0, itemsSold: salesData.monthlySales?.find(d => d.month.endsWith('-09'))?.itemsSold || 0, profit: salesData.monthlySales?.find(d => d.month.endsWith('-09'))?.profit || 0 },
                { month: 'Oct', revenue: salesData.monthlySales?.find(d => d.month.endsWith('-10'))?.revenue || 0, itemsSold: salesData.monthlySales?.find(d => d.month.endsWith('-10'))?.itemsSold || 0, profit: salesData.monthlySales?.find(d => d.month.endsWith('-10'))?.profit || 0 },
                { month: 'Nov', revenue: salesData.monthlySales?.find(d => d.month.endsWith('-11'))?.revenue || 0, itemsSold: salesData.monthlySales?.find(d => d.month.endsWith('-11'))?.itemsSold || 0, profit: salesData.monthlySales?.find(d => d.month.endsWith('-11'))?.profit || 0 },
                { month: 'Dec', revenue: salesData.monthlySales?.find(d => d.month.endsWith('-12'))?.revenue || 0, itemsSold: salesData.monthlySales?.find(d => d.month.endsWith('-12'))?.itemsSold || 0, profit: salesData.monthlySales?.find(d => d.month.endsWith('-12'))?.profit || 0 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={formatCurrency} />
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), '']}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Bar dataKey="revenue" fill="hsl(var(--chart-1))" name="Revenue" />
                <Bar dataKey="itemsSold" fill="hsl(var(--chart-2))" name="Items Sold" />
                <Bar dataKey="profit" fill="hsl(var(--chart-3))" name="Profit" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
