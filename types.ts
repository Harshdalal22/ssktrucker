export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  DRIVER = 'DRIVER',
  FLEET_OWNER = 'FLEET_OWNER',
}

export enum BookingStatus {
  PENDING = 'PENDING', // Waiting for bids
  BIDDING = 'BIDDING', // Bids coming in
  ACCEPTED = 'ACCEPTED', // Driver selected
  IN_PROGRESS = 'IN_PROGRESS', // Truck moving
  COMPLETED = 'COMPLETED',
}

export enum TruckType {
  MINI = 'Mini Truck (1T)',
  LCV = 'LCV (2.5T)',
  FT14 = '14ft Truck',
  FT20 = '20ft Container',
  FT32 = '32ft Container',
}

export interface Bid {
  id: string;
  driverId: string;
  driverName: string;
  amount: number;
  rating: number;
  etaMinutes: number;
  vehicleNo: string;
  timestamp: number;
  vehicleCapacity?: string;
  vehicleDimensions?: string;
}

export interface ChatMessage {
  id: string;
  senderRole: UserRole;
  text: string;
  timestamp: number;
}

export interface BookingRequest {
  id: string;
  customerId: string;
  pickupLocation: string;
  dropLocation: string;
  truckType: TruckType;
  materialType: string;
  weightKg: number;
  budget: number;
  distanceKm: number;
  status: BookingStatus;
  date: string;
  bids: Bid[];
  acceptedBidId?: string;
  createdAt: number;
}

export interface FleetStat {
  truckId: string;
  status: 'IDLE' | 'ACTIVE' | 'MAINTENANCE';
  driverName: string;
  plateNumber: string;
  todaysEarnings: number;
  fuelLevel: number;
  nextServiceDate: string;
  isOnline: boolean;
}