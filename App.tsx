import React, { useState, useEffect } from 'react';
import { UserRole, BookingRequest, BookingStatus, FleetStat, ChatMessage } from './types';
import CustomerPanel from './components/CustomerPanel';
import DriverPanel from './components/DriverPanel';
import FleetPanel from './components/FleetPanel';
import { Truck, User, Building2, Menu, X } from 'lucide-react';
import { socketService } from './services/socketService';

const App: React.FC = () => {
  const [role, setRole] = useState<UserRole>(UserRole.CUSTOMER);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Global State simulating backend
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>({});
  
  const [fleetStats, setFleetStats] = useState<FleetStat[]>([
    { 
      truckId: 't1', 
      plateNumber: 'KA-01-AB-1234', 
      driverName: 'Ramesh K.', 
      status: 'ACTIVE', 
      todaysEarnings: 450, 
      fuelLevel: 65, 
      nextServiceDate: new Date(Date.now() + 45 * 86400000).toISOString().split('T')[0],
      isOnline: true
    },
    { 
      truckId: 't2', 
      plateNumber: 'KA-53-Z-9988', 
      driverName: 'Suresh P.', 
      status: 'IDLE', 
      todaysEarnings: 0, 
      fuelLevel: 90, 
      nextServiceDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0], // Upcoming
      isOnline: true
    },
    { 
      truckId: 't3', 
      plateNumber: 'TN-45-X-1122', 
      driverName: 'John D.', 
      status: 'MAINTENANCE', 
      todaysEarnings: 120, 
      fuelLevel: 20, 
      nextServiceDate: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0], // Overdue
      isOnline: false
    },
    { 
      truckId: 't4', 
      plateNumber: 'MH-12-Q-4455', 
      driverName: 'Vikram S.', 
      status: 'ACTIVE', 
      todaysEarnings: 890, 
      fuelLevel: 45, 
      nextServiceDate: new Date(Date.now() + 120 * 86400000).toISOString().split('T')[0],
      isOnline: false
    },
  ]);

  // Initialize Socket Connection
  useEffect(() => {
    socketService.connect();
    socketService.onMessage((bookingId, message) => {
      setChatMessages(prev => ({
        ...prev,
        [bookingId]: [...(prev[bookingId] || []), message]
      }));
    });
  }, []);

  // Handler to create booking
  const createBooking = (data: Omit<BookingRequest, 'id' | 'status' | 'bids' | 'createdAt'>) => {
    const newBooking: BookingRequest = {
      id: Math.random().toString(36).substr(2, 9),
      customerId: 'cust_1',
      status: BookingStatus.BIDDING,
      bids: [],
      createdAt: Date.now(),
      ...data,
    };
    setBookings(prev => [newBooking, ...prev]);

    // Simulate Fake Drivers Bidding after a delay
    setTimeout(() => {
      const fakeBid = {
        id: Math.random().toString(36),
        driverId: 'd_99',
        driverName: 'Fast Logistics (AI Bot)',
        amount: Math.floor(data.budget * (0.9 + Math.random() * 0.3)), // Random bid around budget
        rating: 4.8,
        etaMinutes: Math.floor(Math.random() * 60) + 15,
        vehicleNo: 'TN-01-AB-1234',
        timestamp: Date.now(),
        vehicleCapacity: '2.5 Tons',
        vehicleDimensions: '14ft x 7ft'
      };
      setBookings(prev => prev.map(b => b.id === newBooking.id ? {...b, bids: [...b.bids, fakeBid]} : b));
    }, 4000);
  };

  // Handler for driver placing bid
  const placeBid = (bookingId: string, amount: number, capacity: string, dimensions: string) => {
    const newBid = {
      id: Math.random().toString(36),
      driverId: 'me_driver_1',
      driverName: 'You (Current Driver)',
      amount: amount,
      rating: 5.0,
      etaMinutes: 20,
      vehicleNo: 'MH-04-DX-9999',
      timestamp: Date.now(),
      vehicleCapacity: capacity,
      vehicleDimensions: dimensions,
    };

    setBookings(prev => prev.map(b => 
      b.id === bookingId ? { ...b, bids: [...b.bids, newBid] } : b
    ));
  };

  // Handler for accepting bid
  const acceptBid = (bookingId: string, bidId: string) => {
    setBookings(prev => prev.map(b => 
      b.id === bookingId ? { ...b, status: BookingStatus.ACCEPTED, acceptedBidId: bidId } : b
    ));
  };

  const handleSendMessage = (bookingId: string, text: string, senderRole: UserRole) => {
    const newMessage: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      senderRole,
      text,
      timestamp: Date.now(),
    };
    // Emit to socket service instead of updating local state directly
    socketService.emitMessage(bookingId, newMessage);
  };

  const handleScheduleMaintenance = (truckId: string, date: string) => {
    setFleetStats(prev => prev.map(truck => 
      truck.truckId === truckId 
        ? { ...truck, nextServiceDate: date, status: 'ACTIVE' } 
        : truck
    ));
  };

  // Handler to toggle driver online status (Simulates the current logged-in driver 't1')
  const handleToggleDriverOnline = () => {
    setFleetStats(prev => prev.map((truck, index) => 
      index === 0 ? { ...truck, isOnline: !truck.isOnline } : truck
    ));
  };

  const navItems = [
    { id: UserRole.CUSTOMER, label: 'Customer', icon: User },
    { id: UserRole.DRIVER, label: 'Driver', icon: Truck },
    { id: UserRole.FLEET_OWNER, label: 'Fleet Owner', icon: Building2 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <Truck className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900">SSK<span className="text-indigo-600">Trucker</span></span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex space-x-1 items-center">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setRole(item.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2
                    ${role === item.id 
                      ? 'bg-slate-900 text-white shadow-md' 
                      : 'text-slate-600 hover:bg-slate-100'
                    }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-slate-500 hover:text-slate-700 focus:outline-none"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 p-2 space-y-1 shadow-lg">
             {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => { setRole(item.id); setMobileMenuOpen(false); }}
                  className={`w-full px-4 py-3 rounded-lg text-left text-sm font-medium flex items-center gap-3
                    ${role === item.id 
                      ? 'bg-indigo-50 text-indigo-700' 
                      : 'text-slate-600'
                    }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label} Panel
                </button>
              ))}
          </div>
        )}
      </nav>

      {/* Main Content Area */}
      <main className="flex-grow pt-6 pb-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {role === UserRole.CUSTOMER && (
            <CustomerPanel 
              bookings={bookings} 
              onCreateBooking={createBooking} 
              onAcceptBid={acceptBid}
              chatMessages={chatMessages}
              onSendMessage={handleSendMessage}
            />
          )}
          
          {role === UserRole.DRIVER && (
            <DriverPanel 
              bookings={bookings} 
              onPlaceBid={placeBid}
              chatMessages={chatMessages}
              onSendMessage={handleSendMessage}
              isOnline={fleetStats[0].isOnline}
              onToggleOnline={handleToggleDriverOnline}
            />
          )}

          {role === UserRole.FLEET_OWNER && (
            <FleetPanel 
              fleetStats={fleetStats} 
              onScheduleMaintenance={handleScheduleMaintenance}
            />
          )}
        </div>
      </main>

      {/* Footer (Sticky for demo context) */}
      <div className="bg-slate-900 text-slate-400 py-6 text-center text-sm">
        <p>&copy; 2024 SSK Trucker Platform. All rights reserved.</p>
      </div>

    </div>
  );
};

export default App;