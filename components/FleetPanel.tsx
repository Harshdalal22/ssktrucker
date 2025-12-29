import React, { useState } from 'react';
import { Truck, Users, TrendingUp, AlertCircle, Wrench, Calendar, Bell, X } from 'lucide-react';
import { FleetStat } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface FleetPanelProps {
  fleetStats: FleetStat[];
  onScheduleMaintenance: (truckId: string, date: string) => void;
}

const revenueData = [
  { name: 'Week 1', revenue: 4000 },
  { name: 'Week 2', revenue: 3000 },
  { name: 'Week 3', revenue: 5000 },
  { name: 'Week 4', revenue: 2780 },
  { name: 'Week 5', revenue: 6890 },
];

const FleetPanel: React.FC<FleetPanelProps> = ({ fleetStats, onScheduleMaintenance }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTruck, setSelectedTruck] = useState<FleetStat | null>(null);
  const [serviceDate, setServiceDate] = useState('');

  // Logic to identify maintenance alerts
  const today = new Date();
  today.setHours(0,0,0,0);

  const maintenanceAlerts = fleetStats.map(truck => {
    const serviceDate = new Date(truck.nextServiceDate);
    serviceDate.setHours(0,0,0,0);
    const diffTime = serviceDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let alertType: 'overdue' | 'upcoming' | null = null;
    if (diffDays < 0) alertType = 'overdue';
    else if (diffDays <= 7) alertType = 'upcoming';

    return { ...truck, diffDays, alertType };
  }).filter(t => t.alertType !== null);

  const handleOpenSchedule = (truck: FleetStat) => {
    setSelectedTruck(truck);
    // Set default date to tomorrow
    const tmr = new Date();
    tmr.setDate(tmr.getDate() + 1);
    setServiceDate(tmr.toISOString().split('T')[0]);
    setIsModalOpen(true);
  };

  const handleSubmitSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTruck && serviceDate) {
      onScheduleMaintenance(selectedTruck.truckId, serviceDate);
      setIsModalOpen(false);
      setSelectedTruck(null);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
           <div className="flex items-center justify-between mb-2">
             <span className="text-slate-500 text-sm font-medium">Total Revenue</span>
             <TrendingUp className="w-5 h-5 text-green-600" />
           </div>
           <p className="text-3xl font-bold text-slate-900">$24,500</p>
           <p className="text-xs text-green-600 mt-1">+12% from last month</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
           <div className="flex items-center justify-between mb-2">
             <span className="text-slate-500 text-sm font-medium">Active Trucks</span>
             <Truck className="w-5 h-5 text-indigo-600" />
           </div>
           <p className="text-3xl font-bold text-slate-900">
             {fleetStats.filter(f => f.status === 'ACTIVE').length} / {fleetStats.length}
           </p>
           <p className="text-xs text-slate-400 mt-1">Fleet utilization</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
           <div className="flex items-center justify-between mb-2">
             <span className="text-slate-500 text-sm font-medium">Drivers Online</span>
             <Users className="w-5 h-5 text-blue-600" />
           </div>
           <p className="text-3xl font-bold text-slate-900">
             {fleetStats.filter(f => f.isOnline).length}
           </p>
           <p className="text-xs text-slate-400 mt-1">Real-time status</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
           <div className="flex items-center justify-between mb-2">
             <span className="text-slate-500 text-sm font-medium">Maintenance</span>
             <Wrench className={`w-5 h-5 ${maintenanceAlerts.length > 0 ? 'text-orange-500' : 'text-slate-400'}`} />
           </div>
           <p className="text-3xl font-bold text-slate-900">{maintenanceAlerts.length}</p>
           <p className={`text-xs mt-1 ${maintenanceAlerts.length > 0 ? 'text-orange-600 font-semibold' : 'text-slate-400'}`}>
             {maintenanceAlerts.length > 0 ? 'Action required' : 'All systems go'}
           </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
           <h3 className="font-bold text-lg text-slate-800 mb-6">Fleet Revenue Analytics</h3>
           <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={revenueData}>
                   <defs>
                     <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                       <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                   <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                   <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="3 3"/>
                   <Tooltip />
                   <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Right Column: Maintenance & Vehicles */}
        <div className="space-y-6">
           
           {/* Maintenance Notifications */}
           {maintenanceAlerts.length > 0 && (
             <div className="bg-white rounded-xl shadow-sm border border-orange-100 overflow-hidden">
                <div className="bg-orange-50 px-4 py-3 border-b border-orange-100 flex items-center gap-2">
                   <Bell className="w-4 h-4 text-orange-600" />
                   <h3 className="font-bold text-sm text-orange-800">Service Reminders</h3>
                </div>
                <div className="p-2 space-y-1">
                  {maintenanceAlerts.map(truck => (
                    <div key={truck.truckId} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition">
                       <div className="flex items-center gap-3">
                         <div className={`w-8 h-8 rounded-full flex items-center justify-center ${truck.alertType === 'overdue' ? 'bg-red-100' : 'bg-yellow-100'}`}>
                           <AlertCircle className={`w-4 h-4 ${truck.alertType === 'overdue' ? 'text-red-600' : 'text-yellow-600'}`} />
                         </div>
                         <div>
                            <p className="font-semibold text-slate-800 text-sm">{truck.plateNumber}</p>
                            <p className="text-xs text-slate-500">
                              {truck.alertType === 'overdue' 
                                ? <span className="text-red-600 font-medium">Overdue by {Math.abs(truck.diffDays)} days</span>
                                : <span className="text-yellow-600 font-medium">Due in {truck.diffDays} days</span>
                              }
                            </p>
                         </div>
                       </div>
                       <button 
                        onClick={() => handleOpenSchedule(truck)}
                        className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-md text-xs font-semibold hover:bg-indigo-100 transition"
                       >
                         Schedule
                       </button>
                    </div>
                  ))}
                </div>
             </div>
           )}

           {/* Vehicle List */}
           <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              <h3 className="font-bold text-lg text-slate-800 mb-4">Vehicle Status</h3>
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                {fleetStats.map(truck => (
                  <div key={truck.truckId} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                     <div className="flex items-center gap-3">
                       <div className="relative">
                         <div className={`w-2 h-2 rounded-full ${truck.status === 'ACTIVE' ? 'bg-green-500' : truck.status === 'MAINTENANCE' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                       </div>
                       <div>
                          <p className="font-semibold text-slate-900 text-sm">
                            {truck.plateNumber}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-xs text-slate-500">{truck.driverName}</p>
                            <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium border ${truck.isOnline ? 'bg-green-50 border-green-100 text-green-700' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${truck.isOnline ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`} />
                              {truck.isOnline ? 'Online' : 'Offline'}
                            </div>
                          </div>
                       </div>
                     </div>
                     <div className="text-right">
                        <p className="font-bold text-slate-700 text-sm">${truck.todaysEarnings}</p>
                        <p className="text-[10px] text-slate-400">Fuel: {truck.fuelLevel}%</p>
                     </div>
                  </div>
                ))}
              </div>
           </div>
        </div>
      </div>

      {/* Schedule Modal */}
      {isModalOpen && selectedTruck && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 relative">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-slate-100 text-slate-500 transition"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Schedule Service</h3>
                <p className="text-sm text-slate-500">{selectedTruck.plateNumber}</p>
              </div>
            </div>

            <form onSubmit={handleSubmitSchedule} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Select Service Date</label>
                <input 
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={serviceDate}
                  onChange={(e) => setServiceDate(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100 flex gap-2 items-start">
                 <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                 <p className="text-xs text-yellow-800">
                   Booking this service will clear the "{selectedTruck.alertType}" alert and update the maintenance schedule.
                 </p>
              </div>

              <div className="flex gap-3 mt-6">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-lg border border-slate-200 font-medium text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2.5 rounded-lg bg-indigo-600 font-bold text-white hover:bg-indigo-700 shadow-md shadow-indigo-200 transition"
                >
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default FleetPanel;