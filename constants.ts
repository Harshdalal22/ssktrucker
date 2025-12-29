import { TruckType } from "./types";

export const MATERIALS = [
  'Household Goods',
  'FMCG',
  'Steel / Iron',
  'Cement / Construction',
  'Electronics',
  'Textiles',
  'Perishables (Fruits/Veg)',
];

export const TRUCK_OPTIONS = Object.values(TruckType);

export const MOCK_LOCATIONS = [
  'Central Warehouse, Industrial Area',
  'City Port Terminal 4',
  'Main Market Square',
  'Tech Park Logistics Hub',
  'Suburban Distribution Center'
];

export const FUEL_PRICE_PER_LITER = 95.5; // Example currency
export const AVG_MILEAGE_KM_LITER = 8; 
export const TOLL_AVG_PER_KM = 2.5;
export const PLATFORM_COMMISSION_PERCENT = 10;
