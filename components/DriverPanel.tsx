import React, { useState } from 'react';
import { Truck, MapPin, DollarSign, Navigation, Activity, BrainCircuit, X, Power, MessageSquare, CheckCircle, Scale, Ruler } from 'lucide-react';
import { BookingRequest, BookingStatus, UserRole, ChatMessage } from '../types';
import { FUEL_PRICE_PER_LITER, AVG_MILEAGE_KM_LITER, TOLL_AVG_PER_KM, PLATFORM_COMMISSION_PERCENT } from '../constants';
import { analyzeRouteAndCosts } from '../services/geminiService';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import ChatWidget from './ChatWidget';

interface DriverPanelProps {
  bookings: BookingRequest[];
  onPlaceBid: (bookingId: string, amount: number, capacity: string, dimensions: string) => void;
  chatMessages: Record<string, ChatMessage[]>;
  onSendMessage: (bookingId: string, text: string, senderRole: UserRole) => void;
  isOnline: boolean;
  onToggleOnline: () => void;
}

const mockEarnings = [
  { day: 'Mon', amt: 240 },
  { day: 'Tue', amt: 139 },
  { day: 'Wed', amt: 980 },
  { day: 'Thu', amt: 390 },
  { day: 'Fri', amt: 480 },
  { day: 'Sat', amt: 380 },
  { day: 'Sun', amt: 430 },
];

const DriverPanel: React.FC<DriverPanelProps> = ({ 
  bookings, 
  onPlaceBid, 
  chatMessages, 
  onSendMessage,
  isOnline,
  onToggleOnline
}) => {
  const [selectedBooking, setSelectedBooking] = useState<BookingRequest | null>(null);
  const [bidAmount, setBidAmount] = useState<number>(0);
  const [capacity, setCapacity] = useState<string>('');
  const [dimensions, setDimensions] = useState<string>('');
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [analyzing, setAnalyzing] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Filter requests that are active or bidding
  const openRequests = bookings.filter(b => b.status === BookingStatus.BIDDING || b.status === BookingStatus.PENDING);

  // Identify current active job (Booking is ACCEPTED and current driver is the winner)
  const currentJob = bookings.find(b => 
    b.status === BookingStatus.ACCEPTED && 
    b.acceptedBidId && 
    b.bids.find(bid => bid.id === b.acceptedBidId && bid.driverId === 'me_driver_1')
  );

  // Check for unread messages (if chat is closed and last message is NOT from me)
  const hasUnreadMessages = currentJob && 
    chatMessages[currentJob.id]?.length > 0 && 
    chatMessages[currentJob.id][chatMessages[currentJob.id].length - 1].senderRole !== UserRole.DRIVER &&
    !isChatOpen;

  const handleOpenBid = (booking: BookingRequest) => {
    setSelectedBooking(booking);
    setBidAmount(booking.budget * 1.1); // Suggest 10% more by default
    setCapacity(''); 
    setDimensions('');
    setAiAnalysis('');
  };

  const handleAnalyze = async () => {
    if (!selectedBooking) return;
    setAnalyzing(true);
    const result = await analyzeRouteAndCosts(
      selectedBooking.pickupLocation,
      selectedBooking.dropLocation,
      selectedBooking.distanceKm,
      selectedBooking.truckType
    );
    setAiAnalysis(result);
    setAnalyzing(false);
  };

  const calculateCosts = (distance: number, bid: number) => {
    const fuelCost = (distance / AVG_MILEAGE_KM_LITER) * FUEL_PRICE_PER_LITER;
    const tollCost = distance * TOLL_AVG_PER_KM;
    const commission = (bid * PLATFORM_COMMISSION_PERCENT) / 100;
    const totalExpense = fuelCost + tollCost + commission;
    const net = bid - totalExpense;
    return { fuelCost, tollCost, commission, net };
  };

  return (
    <div className="p-4 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Left Column: Feed */}
      <div className="lg:col-span-2 space-y-6">
        {/* Active Job Section */}
        {currentJob && (
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10">
               <Truck className="w-32 h-32" />
             </div>
             <div className="relative z-10">
               <div className="flex justify-between items-start mb-4">
                 <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-xs font-medium">
                   <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                   IN PROGRESS
                 </div>
                 <button 
                   onClick={() => setIsChatOpen(!isChatOpen)}
                   className="flex items-center gap-2 bg-white text-indigo-700 px-4 py-2 rounded-lg font-bold text-sm hover:bg-indigo-50 transition shadow-sm relative"
                 >
                   <MessageSquare className="w-4 h-4" /> 
                   Chat with Customer
                   {hasUnreadMessages && (
                     <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-white animate-pulse" />
                   )}
                 </button>
               </div>
               
               <h2 className="text-2xl font-bold mb-1">Current Job #{currentJob.id.slice(0,6)}</h2>
               <p className="text-indigo-100 text-sm mb-6">Navigating to pickup location...</p>

               <div className="grid grid-cols-2 gap-4 bg-white/10 p-4 rounded-lg">
                  <div>
                    <p className="text-indigo-200 text-xs uppercase tracking-wide">Pickup</p>
                    <p className="font-semibold">{currentJob.pickupLocation}</p>
                  </div>
                  <div>
                    <p className="text-indigo-200 text-xs uppercase tracking-wide">Drop</p>
                    <p className="font-semibold">{currentJob.dropLocation}</p>
                  </div>
               </div>
             </div>
          </div>
        )}

        <div className="flex items-center justify-between">
           <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
             <Activity className={isOnline ? "text-green-600" : "text-slate-400"} /> New Load Requests
           </h2>
        </div>
        
        {!isOnline ? (
          <div className="text-center p-12 bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Power className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700">You are currently Offline</h3>
            <p className="text-slate-500 mb-6">Go online to start receiving load requests.</p>
            <button 
              onClick={onToggleOnline}
              className="bg-slate-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-slate-800 transition shadow-lg shadow-slate-200"
            >
              Go Online
            </button>
          </div>
        ) : openRequests.length === 0 ? (
          <div className="text-center p-12 bg-white rounded-xl shadow-sm">
            <p className="text-slate-500">No active requests nearby.</p>
          </div>
        ) : (
          openRequests.map(req => (
            <div key={req.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition">
              <div className="flex justify-between items-start">
                 <div>
                    <h3 className="font-semibold text-lg text-slate-800">{req.materialType} <span className="text-slate-400 font-normal">({req.weightKg} kg)</span></h3>
                    <div className="flex flex-col gap-1 mt-2 text-sm text-slate-600">
                       <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500" /> {req.pickupLocation}</div>
                       <div className="h-4 border-l-2 border-slate-200 ml-[3px]" />
                       <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500" /> {req.dropLocation}</div>
                    </div>
                    <div className="mt-3 inline-flex items-center gap-2 bg-slate-100 px-3 py-1 rounded text-xs font-medium text-slate-600">
                      <Truck className="w-3 h-3" /> {req.truckType} • {req.distanceKm} km
                    </div>
                 </div>
                 <div className="text-right flex flex-col items-end">
                    <span className="text-sm text-slate-400">Est. Budget</span>
                    <span className="text-2xl font-bold text-slate-900">${req.budget}</span>
                    <button 
                      onClick={() => handleOpenBid(req)}
                      className="mt-3 bg-indigo-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-indigo-700 transition"
                    >
                      Make Offer
                    </button>
                 </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Right Column: Earnings Dashboard */}
      <div className="space-y-6">
         <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
            <h3 className="font-semibold text-slate-800 mb-4">Weekly Earnings</h3>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockEarnings}>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="amt" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-between mt-4 pt-4 border-t border-slate-50">
               <div>
                 <p className="text-xs text-slate-500">Total Revenue</p>
                 <p className="text-lg font-bold text-slate-800">$2,450</p>
               </div>
               <div className="text-right">
                 <p className="text-xs text-slate-500">Completed Trips</p>
                 <p className="text-lg font-bold text-slate-800">12</p>
               </div>
            </div>
         </div>
         
         <div className={`p-5 rounded-xl transition-all duration-300 ${isOnline ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' : 'bg-white text-slate-500 border border-slate-200'}`}>
           <div className="flex justify-between items-center mb-2">
             <h3 className="font-semibold">Driver Status</h3>
             <button 
                onClick={onToggleOnline}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isOnline ? 'bg-green-500' : 'bg-slate-300'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${isOnline ? 'translate-x-6' : 'translate-x-1'}`} />
             </button>
           </div>
           <div className="flex items-center gap-3">
             <div className={`w-3 h-3 rounded-full transition-colors ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`}></div>
             <span className={`transition-colors ${isOnline ? 'text-slate-300' : 'text-slate-400'}`}>
               {isOnline ? 'Online & Searching' : 'Offline'}
             </span>
           </div>
         </div>
      </div>

      {/* Bidding Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
           <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 h-[80vh] overflow-y-auto">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 sticky top-0 z-10">
                <h3 className="font-bold text-lg text-slate-800">Place Your Bid</h3>
                <button onClick={() => setSelectedBooking(null)} className="p-1 hover:bg-slate-200 rounded-full transition"><X className="w-5 h-5 text-slate-500" /></button>
              </div>
              
              <div className="p-6 space-y-6">
                
                {/* Calculator */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">My Bid Price ($)</label>
                    <div className="flex items-center gap-2 mt-1">
                      <DollarSign className="text-indigo-600" />
                      <input 
                        type="number" 
                        className="bg-transparent text-3xl font-bold text-slate-900 outline-none w-full border-b border-slate-300 focus:border-indigo-600 transition"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(Number(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                         <Scale className="w-3 h-3" /> Vehicle Capacity
                      </label>
                      <input 
                        type="text" 
                        placeholder="e.g. 2.5 Tons"
                        className="w-full mt-1 px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
                        value={capacity}
                        onChange={(e) => setCapacity(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                         <Ruler className="w-3 h-3" /> Dimensions
                      </label>
                      <input 
                        type="text" 
                        placeholder="e.g. 14ft x 7ft x 7ft"
                        className="w-full mt-1 px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
                        value={dimensions}
                        onChange={(e) => setDimensions(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  {/* Cost Breakdown */}
                  {(() => {
                    const costs = calculateCosts(selectedBooking.distanceKm, bidAmount);
                    return (
                      <div className="pt-4 border-t border-slate-200 grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-slate-500">Est. Fuel</p>
                          <p className="font-medium text-slate-800">-${costs.fuelCost.toFixed(0)}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Tolls</p>
                          <p className="font-medium text-slate-800">-${costs.tollCost.toFixed(0)}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Commission (10%)</p>
                          <p className="font-medium text-slate-800">-${costs.commission.toFixed(0)}</p>
                        </div>
                        <div className="col-span-2 bg-green-50 p-2 rounded-lg flex justify-between items-center border border-green-100">
                          <span className="font-semibold text-green-800">Net Profit</span>
                          <span className="font-bold text-xl text-green-700">+${costs.net.toFixed(0)}</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* AI Analysis */}
                <div>
                   <button 
                     onClick={handleAnalyze}
                     disabled={analyzing}
                     className="text-sm text-indigo-600 font-medium flex items-center gap-1 hover:text-indigo-800 mb-2"
                   >
                     <BrainCircuit className="w-4 h-4" /> 
                     {analyzing ? 'Analyzing Route...' : 'Ask AI for Route Insights'}
                   </button>
                   {aiAnalysis && (
                     <div className="bg-indigo-50 p-3 rounded-lg text-sm text-indigo-900 border border-indigo-100 leading-relaxed">
                       {aiAnalysis}
                     </div>
                   )}
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => setSelectedBooking(null)}
                    className="flex-1 py-3 rounded-xl border border-slate-200 font-medium text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      onPlaceBid(selectedBooking.id, bidAmount, capacity, dimensions);
                      setSelectedBooking(null);
                    }}
                    className="flex-1 py-3 rounded-xl bg-indigo-600 font-bold text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200"
                  >
                    Submit Bid
                  </button>
                </div>

              </div>
           </div>
        </div>
      )}

      {/* Chat Widget */}
      {currentJob && (
         <ChatWidget 
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
            messages={chatMessages[currentJob.id] || []}
            onSendMessage={(text) => onSendMessage(currentJob.id, text, UserRole.DRIVER)}
            currentUserRole={UserRole.DRIVER}
            recipientName="Customer"
         />
      )}
    </div>
  );
};

export default DriverPanel;