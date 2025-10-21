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
  dailyData: Array<{
    date: string;
    revenue: number;
    cost: number;
    profit: number;
  }>;
  monthlyData: Array<{
    month: string;
    revenue: number;
    cost: number;
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
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sales Analytics</h1>
          <p className="text-gray-600 mt-1">Track your sales performance and trends</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'daily' ? 'default' : 'outline'}
            onClick={() => setViewMode('daily')}
            className="flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            Daily View
          </Button>
          <Button
            variant={viewMode === 'monthly' ? 'default' : 'outline'}
            onClick={() => setViewMode('monthly')}
            className="flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Monthly View
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(salesData.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +12.5% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(salesData.totalCost)}</div>
            <p className="text-xs text-muted-foreground">
              +8.2% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(salesData.totalProfit)}</div>
            <p className="text-xs text-muted-foreground">
              +15.3% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(calculatedProfitMargin)}</div>
            <p className="text-xs text-muted-foreground">
              +2.1% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      {viewMode === 'daily' ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Daily Sales Calendar</CardTitle>
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
                const dayData = salesData.dailyData?.find(d => {
                  const date = new Date(d.date);
                  return date.getDate() === day && date.getMonth() === currentMonth.getMonth();
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
        <Card>
          <CardHeader>
            <CardTitle>Monthly Sales Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={[
                { month: 'Jan', revenue: salesData.monthlyData?.find(d => d.month === 'Jan')?.revenue || 0, cost: salesData.monthlyData?.find(d => d.month === 'Jan')?.cost || 0, profit: salesData.monthlyData?.find(d => d.month === 'Jan')?.profit || 0 },
                { month: 'Feb', revenue: salesData.monthlyData?.find(d => d.month === 'Feb')?.revenue || 0, cost: salesData.monthlyData?.find(d => d.month === 'Feb')?.cost || 0, profit: salesData.monthlyData?.find(d => d.month === 'Feb')?.profit || 0 },
                { month: 'Mar', revenue: salesData.monthlyData?.find(d => d.month === 'Mar')?.revenue || 0, cost: salesData.monthlyData?.find(d => d.month === 'Mar')?.cost || 0, profit: salesData.monthlyData?.find(d => d.month === 'Mar')?.profit || 0 },
                { month: 'Apr', revenue: salesData.monthlyData?.find(d => d.month === 'Apr')?.revenue || 0, cost: salesData.monthlyData?.find(d => d.month === 'Apr')?.cost || 0, profit: salesData.monthlyData?.find(d => d.month === 'Apr')?.profit || 0 },
                { month: 'May', revenue: salesData.monthlyData?.find(d => d.month === 'May')?.revenue || 0, cost: salesData.monthlyData?.find(d => d.month === 'May')?.cost || 0, profit: salesData.monthlyData?.find(d => d.month === 'May')?.profit || 0 },
                { month: 'Jun', revenue: salesData.monthlyData?.find(d => d.month === 'Jun')?.revenue || 0, cost: salesData.monthlyData?.find(d => d.month === 'Jun')?.cost || 0, profit: salesData.monthlyData?.find(d => d.month === 'Jun')?.profit || 0 },
                { month: 'Jul', revenue: salesData.monthlyData?.find(d => d.month === 'Jul')?.revenue || 0, cost: salesData.monthlyData?.find(d => d.month === 'Jul')?.cost || 0, profit: salesData.monthlyData?.find(d => d.month === 'Jul')?.profit || 0 },
                { month: 'Aug', revenue: salesData.monthlyData?.find(d => d.month === 'Aug')?.revenue || 0, cost: salesData.monthlyData?.find(d => d.month === 'Aug')?.cost || 0, profit: salesData.monthlyData?.find(d => d.month === 'Aug')?.profit || 0 },
                { month: 'Sep', revenue: salesData.monthlyData?.find(d => d.month === 'Sep')?.revenue || 0, cost: salesData.monthlyData?.find(d => d.month === 'Sep')?.cost || 0, profit: salesData.monthlyData?.find(d => d.month === 'Sep')?.profit || 0 },
                { month: 'Oct', revenue: salesData.monthlyData?.find(d => d.month === 'Oct')?.revenue || 0, cost: salesData.monthlyData?.find(d => d.month === 'Oct')?.cost || 0, profit: salesData.monthlyData?.find(d => d.month === 'Oct')?.profit || 0 },
                { month: 'Nov', revenue: salesData.monthlyData?.find(d => d.month === 'Nov')?.revenue || 0, cost: salesData.monthlyData?.find(d => d.month === 'Nov')?.cost || 0, profit: salesData.monthlyData?.find(d => d.month === 'Nov')?.profit || 0 },
                { month: 'Dec', revenue: salesData.monthlyData?.find(d => d.month === 'Dec')?.revenue || 0, cost: salesData.monthlyData?.find(d => d.month === 'Dec')?.cost || 0, profit: salesData.monthlyData?.find(d => d.month === 'Dec')?.profit || 0 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={formatCurrency} />
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), '']}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" />
                <Bar dataKey="cost" fill="#ef4444" name="Cost" />
                <Bar dataKey="profit" fill="#10b981" name="Profit" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
