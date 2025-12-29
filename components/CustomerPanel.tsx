import React, { useState, useEffect } from 'react';
import { MapPin, Truck, Calendar, Package, Clock, Star, ShieldCheck, DollarSign, MessageSquare } from 'lucide-react';
import { BookingRequest, BookingStatus, TruckType, Bid, UserRole, ChatMessage } from '../types';
import { MATERIALS, TRUCK_OPTIONS } from '../constants';
import ChatWidget from './ChatWidget';

interface CustomerPanelProps {
  bookings: BookingRequest[];
  onCreateBooking: (booking: Omit<BookingRequest, 'id' | 'status' | 'bids' | 'createdAt'>) => void;
  onAcceptBid: (bookingId: string, bidId: string) => void;
  chatMessages: Record<string, ChatMessage[]>;
  onSendMessage: (bookingId: string, text: string, senderRole: UserRole) => void;
}

const CustomerPanel: React.FC<CustomerPanelProps> = ({ 
  bookings, 
  onCreateBooking, 
  onAcceptBid,
  chatMessages,
  onSendMessage
}) => {
  const [view, setView] = useState<'create' | 'tracking'>('create');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [formData, setFormData] = useState({
    pickupLocation: '',
    dropLocation: '',
    truckType: TruckType.MINI,
    materialType: MATERIALS[0],
    weightKg: 100,
    budget: 0,
    date: new Date().toISOString().split('T')[0],
  });

  // Find active booking if any
  const activeBooking = bookings.find(b => b.status !== BookingStatus.COMPLETED);

  // Check for unread messages (if chat is closed and last message is NOT from me)
  const hasUnreadMessages = activeBooking && 
    chatMessages[activeBooking.id]?.length > 0 && 
    chatMessages[activeBooking.id][chatMessages[activeBooking.id].length - 1].senderRole !== UserRole.CUSTOMER &&
    !isChatOpen;

  useEffect(() => {
    if (activeBooking) {
      setView('tracking');
    } else {
      setView('create');
    }
  }, [activeBooking]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate distance calc
    const mockDistance = Math.floor(Math.random() * 300) + 20; 
    
    onCreateBooking({
      ...formData,
      distanceKm: mockDistance,
    });
  };

  if (view === 'tracking' && activeBooking) {
    const acceptedBid = activeBooking.acceptedBidId 
      ? activeBooking.bids.find(b => b.id === activeBooking.acceptedBidId) 
      : null;

    return (
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Status Header */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Trip #{activeBooking.id.slice(0,6)}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold
                ${activeBooking.status === BookingStatus.PENDING ? 'bg-yellow-100 text-yellow-800' : ''}
                ${activeBooking.status === BookingStatus.BIDDING ? 'bg-blue-100 text-blue-800' : ''}
                ${activeBooking.status === BookingStatus.ACCEPTED ? 'bg-green-100 text-green-800' : ''}
              `}>
                {activeBooking.status.replace('_', ' ')}
              </span>
              <span className="text-slate-500 text-sm">{activeBooking.distanceKm} km trip</span>
            </div>
          </div>
          {activeBooking.status === BookingStatus.ACCEPTED && (
             <div className="flex gap-2">
               <button 
                onClick={() => setIsChatOpen(!isChatOpen)}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition flex items-center gap-2 relative"
               >
                 <MessageSquare className="w-4 h-4" /> 
                 Chat
                 {hasUnreadMessages && (
                   <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-white animate-pulse" />
                 )}
               </button>
               <button className="bg-slate-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-slate-800 transition">
                 Call Driver
               </button>
             </div>
          )}
        </div>

        {/* Map Simulation */}
        <div className="bg-slate-200 h-64 rounded-2xl flex items-center justify-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-cover bg-center opacity-40" style={{ backgroundImage: 'url(https://picsum.photos/1200/400?grayscale)' }}></div>
          <div className="relative z-10 bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-lg text-center">
            <MapPin className="w-8 h-8 text-red-500 mx-auto mb-2 animate-bounce" />
            <p className="font-semibold text-slate-800">Live Tracking Active</p>
            <p className="text-xs text-slate-500">Updating GPS...</p>
          </div>
        </div>

        {/* Bidding Section */}
        {activeBooking.status === BookingStatus.BIDDING && (
          <div className="space-y-4">
             <h3 className="text-lg font-semibold text-slate-700 flex items-center gap-2">
               <Clock className="w-5 h-5 text-indigo-600 animate-pulse" />
               Live Bids ({activeBooking.bids.length})
             </h3>
             <div className="grid gap-4 md:grid-cols-2">
                {activeBooking.bids.length === 0 ? (
                  <div className="col-span-2 p-8 text-center text-slate-400 bg-white rounded-xl border border-dashed border-slate-300">
                    Waiting for drivers to bid...
                  </div>
                ) : (
                  activeBooking.bids.map((bid) => (
                    <div key={bid.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 transition-all">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                             <Truck className="w-5 h-5 text-slate-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-900">{bid.driverName}</h4>
                            <div className="flex items-center text-xs text-slate-500 gap-1">
                              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                              {bid.rating} • {bid.vehicleNo}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-slate-900">${bid.amount}</p>
                          <p className="text-xs text-green-600 font-medium">ETA {bid.etaMinutes} mins</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => onAcceptBid(activeBooking.id, bid.id)}
                          className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
                        >
                          Accept Offer
                        </button>
                        <button className="px-4 py-2 text-slate-600 border border-slate-200 rounded-lg text-sm hover:bg-slate-50">
                          Negotiate
                        </button>
                      </div>
                    </div>
                  ))
                )}
             </div>
          </div>
        )}

        {/* Trip Details (Once Accepted) */}
        {activeBooking.status === BookingStatus.ACCEPTED && acceptedBid && (
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
             <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Booking Confirmed!</h3>
                  <p className="text-slate-500">Your truck is on the way to the pickup point.</p>
                </div>
             </div>
             <div className="space-y-4 text-sm">
                <div className="flex justify-between border-b border-slate-100 pb-2">
                   <span className="text-slate-500">Pickup</span>
                   <span className="font-medium text-slate-800">{activeBooking.pickupLocation}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                   <span className="text-slate-500">Drop</span>
                   <span className="font-medium text-slate-800">{activeBooking.dropLocation}</span>
                </div>
                <div className="flex justify-between pt-2">
                   <span className="text-slate-500">Total Fare</span>
                   <span className="font-bold text-indigo-600 text-lg">
                      ${acceptedBid.amount}
                   </span>
                </div>
             </div>
           </div>
        )}

        <ChatWidget 
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          messages={chatMessages[activeBooking.id] || []}
          onSendMessage={(text) => onSendMessage(activeBooking.id, text, UserRole.CUSTOMER)}
          currentUserRole={UserRole.CUSTOMER}
          recipientName={acceptedBid?.driverName || 'Driver'}
        />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-slate-900 p-6 text-white">
          <h1 className="text-2xl font-bold">Book a Truck</h1>
          <p className="text-slate-400">Get instant prices from top-rated drivers</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="space-y-2">
               <label className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Pickup Location</label>
               <div className="relative">
                 <MapPin className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                 <input 
                    required
                    type="text" 
                    placeholder="Enter pickup address"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                    value={formData.pickupLocation}
                    onChange={e => setFormData({...formData, pickupLocation: e.target.value})}
                 />
               </div>
             </div>

             <div className="space-y-2">
               <label className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Drop Location</label>
               <div className="relative">
                 <MapPin className="absolute left-3 top-3 w-5 h-5 text-indigo-500" />
                 <input 
                    required
                    type="text" 
                    placeholder="Enter drop address"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                    value={formData.dropLocation}
                    onChange={e => setFormData({...formData, dropLocation: e.target.value})}
                 />
               </div>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
               <label className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Vehicle Type</label>
               <div className="relative">
                 <Truck className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                 <select 
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                    value={formData.truckType}
                    onChange={e => setFormData({...formData, truckType: e.target.value as TruckType})}
                 >
                   {TRUCK_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                 </select>
               </div>
            </div>
            <div className="space-y-2">
               <label className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Material</label>
               <div className="relative">
                 <Package className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                 <select 
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                    value={formData.materialType}
                    onChange={e => setFormData({...formData, materialType: e.target.value})}
                 >
                   {MATERIALS.map(mat => <option key={mat} value={mat}>{mat}</option>)}
                 </select>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
               <label className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Your Offer ($)</label>
               <div className="relative">
                 <DollarSign className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                 <input 
                    type="number" 
                    placeholder="e.g. 150"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.budget || ''}
                    onChange={e => setFormData({...formData, budget: parseInt(e.target.value) || 0})}
                 />
               </div>
             </div>
             <div className="space-y-2">
               <label className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Date</label>
               <div className="relative">
                 <Calendar className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                 <input 
                    type="date" 
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                 />
               </div>
             </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-indigo-200 active:scale-[0.98] flex items-center justify-center gap-2"
          >
            Find Trucks Now <Truck className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default CustomerPanel;