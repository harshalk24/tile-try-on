// Utility functions for room estimation calculations

export interface TileDimensions {
  length: number;
  width: number;
  unit: 'ft' | 'm' | 'cm' | 'mm';
}

export interface RoomArea {
  area: number;
  unit: 'sqft' | 'sqm' | 'sqyd';
}

// Unit conversion factors to square feet
export const areaConversionFactors = {
  sqft: 1,
  sqm: 10.764, // 1 sqm = 10.764 sqft
  sqyd: 9, // 1 sqyd = 9 sqft
};

export const tileConversionFactors = {
  ft: 1,
  m: 3.281, // 1m = 3.281ft
  cm: 0.0328, // 1cm = 0.0328ft
  mm: 0.00328, // 1mm = 0.00328ft
};

export interface EstimationResult {
  tilesRequired: number;
  totalCost: number;
  roomAreaSqft: number;
  tileAreaSqft: number;
  wastagePercentage: number;
}

/**
 * Calculate the number of tiles required and total cost
 * @param roomArea - Room area with unit
 * @param tileDimensions - Tile dimensions with unit
 * @param costPerTile - Cost per tile in rupees
 * @param wastagePercentage - Wastage percentage (default 10%)
 * @returns Estimation result
 */
export function calculateTileEstimation(
  roomArea: RoomArea,
  tileDimensions: TileDimensions,
  costPerTile: number,
  wastagePercentage: number = 10
): EstimationResult {
  // Convert room area to square feet
  const roomAreaSqft = roomArea.area * areaConversionFactors[roomArea.unit];

  // Convert tile dimensions to feet
  const tileLengthFt = tileDimensions.length * tileConversionFactors[tileDimensions.unit];
  const tileWidthFt = tileDimensions.width * tileConversionFactors[tileDimensions.unit];

  // Calculate tile area in square feet
  const tileAreaSqft = tileLengthFt * tileWidthFt;

  // Calculate number of tiles required (with wastage)
  const tilesRequired = Math.ceil((roomAreaSqft / tileAreaSqft) * (1 + wastagePercentage / 100));

  // Calculate total cost
  const totalCost = tilesRequired * costPerTile;

  return {
    tilesRequired,
    totalCost,
    roomAreaSqft,
    tileAreaSqft,
    wastagePercentage,
  };
}

/**
 * Format currency in Indian Rupees
 * @param amount - Amount to format
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format number with Indian locale
 * @param number - Number to format
 * @returns Formatted number string
 */
export function formatNumber(number: number): string {
  return new Intl.NumberFormat('en-IN').format(number);
}
