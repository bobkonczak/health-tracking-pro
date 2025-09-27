'use client';

import React, { useState } from 'react';
import { Settings, Webhook, Bell, Database, Download, Upload, Palette } from 'lucide-react';
import { Header } from '@/src/components/layout/Header';
import { User } from '@/src/types';

export default function SettingsPage() {
  const [selectedUser, setSelectedUser] = useState<User>('Bob');

  return (
    <div className="min-h-screen bg-background">
      <Header selectedUser={selectedUser} onUserChange={setSelectedUser} />

      <main className="container mx-auto px-4 py-6 md:px-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Page Header */}
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <Settings className="w-8 h-8 mr-3" />
              Settings
            </h1>
            <p className="text-muted-foreground mt-2">
              Configure your health tracking preferences and integrations
            </p>
          </div>

          {/* Webhook Configuration */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Webhook className="w-5 h-5 mr-2" />
              Webhook Configuration
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Pipedream Webhook URL</label>
                <input
                  type="url"
                  placeholder="https://your-pipedream-webhook-url.com"
                  className="w-full mt-1 px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                  defaultValue="https://health.konczak.io/api/health-data"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  This URL receives automatic updates from Withings
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="auto-sync"
                  defaultChecked
                  className="rounded"
                />
                <label htmlFor="auto-sync" className="text-sm">
                  Enable automatic synchronization
                </label>
              </div>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Bell className="w-5 h-5 mr-2" />
              Notification Preferences
            </h2>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="daily-reminder"
                  defaultChecked
                  className="rounded"
                />
                <label htmlFor="daily-reminder" className="text-sm">
                  Daily checklist reminder (8:00 PM)
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="streak-alerts"
                  defaultChecked
                  className="rounded"
                />
                <label htmlFor="streak-alerts" className="text-sm">
                  Streak milestone notifications
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="competition-updates"
                  defaultChecked
                  className="rounded"
                />
                <label htmlFor="competition-updates" className="text-sm">
                  Weekly competition updates
                </label>
              </div>
            </div>
          </div>

          {/* Data Management */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Database className="w-5 h-5 mr-2" />
              Data Management
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <button className="btn-secondary flex items-center justify-center space-x-2">
                  <Download className="w-4 h-4" />
                  <span>Export Data (CSV)</span>
                </button>
                <button className="btn-secondary flex items-center justify-center space-x-2">
                  <Upload className="w-4 h-4" />
                  <span>Import Data</span>
                </button>
              </div>
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  ⚠️ Data is automatically synced with Supabase database
                </p>
              </div>
            </div>
          </div>

          {/* Display Preferences */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Palette className="w-5 h-5 mr-2" />
              Display Preferences
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Theme</label>
                <select className="w-full mt-1 px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700">
                  <option value="system">System</option>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Date Format</label>
                <select className="w-full mt-1 px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700">
                  <option value="dd/mm/yyyy">DD/MM/YYYY</option>
                  <option value="mm/dd/yyyy">MM/DD/YYYY</option>
                  <option value="yyyy-mm-dd">YYYY-MM-DD</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Units</label>
                <select className="w-full mt-1 px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700">
                  <option value="metric">Metric (kg, cm)</option>
                  <option value="imperial">Imperial (lbs, in)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button className="btn-primary px-6 py-2">
              Save Settings
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}