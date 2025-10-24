import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Calculator, AlertCircle, Info } from "lucide-react";
import { toast } from "sonner";
import { calculateTileEstimation, formatCurrency, formatNumber } from "../utils/estimationUtils";

interface EstimationResult {
  tilesRequired: number;
  totalCost: number;
}

interface RoomEstimationProps {
  onEstimate?: (result: EstimationResult) => void;
}

const RoomEstimation = ({ onEstimate }: RoomEstimationProps) => {
  const [roomArea, setRoomArea] = useState<string>("");
  const [areaUnit, setAreaUnit] = useState<string>("sqft");
  const [tileLength, setTileLength] = useState<string>("");
  const [tileWidth, setTileWidth] = useState<string>("");
  const [tileUnit, setTileUnit] = useState<string>("ft");
  const [costPerTile, setCostPerTile] = useState<string>("");
  const [result, setResult] = useState<EstimationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);


  // Common tile sizes for quick selection
  const commonTileSizes = [
    { name: "12x12 inches", length: "1", width: "1", unit: "ft" },
    { name: "18x18 inches", length: "1.5", width: "1.5", unit: "ft" },
    { name: "24x24 inches", length: "2", width: "2", unit: "ft" },
    { name: "600x600mm", length: "600", width: "600", unit: "mm" },
    { name: "300x300mm", length: "300", width: "300", unit: "mm" },
  ];


  const validateInputs = (): string | null => {
    if (!roomArea || parseFloat(roomArea) <= 0) {
      return "Please enter a valid room area";
    }
    if (!tileLength || parseFloat(tileLength) <= 0) {
      return "Please enter a valid tile length";
    }
    if (!tileWidth || parseFloat(tileWidth) <= 0) {
      return "Please enter a valid tile width";
    }
    if (!costPerTile || parseFloat(costPerTile) <= 0) {
      return "Please enter a valid cost per tile";
    }
    return null;
  };

  const calculateEstimate = async () => {
    const validationError = validateInputs();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsCalculating(true);

    try {
      const estimationResult = calculateTileEstimation(
        {
          area: parseFloat(roomArea),
          unit: areaUnit as 'sqft' | 'sqm' | 'sqyd'
        },
        {
          length: parseFloat(tileLength),
          width: parseFloat(tileWidth),
          unit: tileUnit as 'ft' | 'm' | 'cm' | 'mm'
        },
        parseFloat(costPerTile),
        10 // 10% wastage
      );

      const result: EstimationResult = {
        tilesRequired: estimationResult.tilesRequired,
        totalCost: estimationResult.totalCost,
      };

      setResult(result);
      onEstimate?.(result);
      toast.success("Estimate calculated successfully!");
    } catch (error) {
      toast.error("Error calculating estimate. Please check your inputs.");
      console.error("Calculation error:", error);
    } finally {
      setIsCalculating(false);
    }
  };

  const resetForm = () => {
    setRoomArea("");
    setAreaUnit("sqft");
    setTileLength("");
    setTileWidth("");
    setTileUnit("ft");
    setCostPerTile("");
    setResult(null);
  };

  const selectCommonTileSize = (tileSize: typeof commonTileSizes[0]) => {
    setTileLength(tileSize.length);
    setTileWidth(tileSize.width);
    setTileUnit(tileSize.unit);
  };

  return (
    <div className="space-y-6">
      <Card className="border border-border shadow-medium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Room Cost Estimation
          </CardTitle>
          <CardDescription>
            Get an estimate of tiles required and total cost for your room
          </CardDescription>
          <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">How it works:</p>
              <p className="text-xs mt-1">Enter your room area, tile size, and cost per tile. We'll calculate the number of tiles needed including 10% wastage for cutting and installation.</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Room Area Input */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="roomArea">Room Area</Label>
              <Input
                id="roomArea"
                type="number"
                placeholder="Enter room area"
                value={roomArea}
                onChange={(e) => setRoomArea(e.target.value)}
                min="0"
                step="0.01"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="areaUnit">Unit</Label>
              <Select value={areaUnit} onValueChange={setAreaUnit}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sqft">Square Feet (sq ft)</SelectItem>
                  <SelectItem value="sqm">Square Meters (sq m)</SelectItem>
                  <SelectItem value="sqyd">Square Yards (sq yd)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tile Size Inputs */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Tile Size</Label>
            
            {/* Common Tile Sizes */}
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Quick Select Common Sizes:</Label>
              <div className="flex flex-wrap gap-2">
                {commonTileSizes.map((tileSize, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => selectCommonTileSize(tileSize)}
                    className="text-xs"
                  >
                    {tileSize.name}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tileLength">Length</Label>
                <Input
                  id="tileLength"
                  type="number"
                  placeholder="e.g., 2"
                  value={tileLength}
                  onChange={(e) => setTileLength(e.target.value)}
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tileWidth">Width</Label>
                <Input
                  id="tileWidth"
                  type="number"
                  placeholder="e.g., 2"
                  value={tileWidth}
                  onChange={(e) => setTileWidth(e.target.value)}
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tileUnit">Unit</Label>
                <Select value={tileUnit} onValueChange={setTileUnit}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ft">Feet (ft)</SelectItem>
                    <SelectItem value="m">Meters (m)</SelectItem>
                    <SelectItem value="cm">Centimeters (cm)</SelectItem>
                    <SelectItem value="mm">Millimeters (mm)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Cost Per Tile */}
          <div className="space-y-2">
            <Label htmlFor="costPerTile">Cost Per Tile (₹)</Label>
            <Input
              id="costPerTile"
              type="number"
              placeholder="Enter cost per tile"
              value={costPerTile}
              onChange={(e) => setCostPerTile(e.target.value)}
              min="0"
              step="0.01"
            />
            <p className="text-xs text-muted-foreground">
              Typical range: ₹50-500 per tile (varies by material and quality)
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={calculateEstimate}
              disabled={isCalculating}
              className="flex-1 gap-2 bg-primary hover:bg-primary/90"
            >
              <Calculator className="h-4 w-4" />
              {isCalculating ? "Calculating..." : "Get Estimate"}
            </Button>
            <Button
              onClick={resetForm}
              variant="outline"
              className="px-6"
            >
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <Card className="border border-green-200 bg-green-50/50 shadow-medium">
          <CardHeader>
            <CardTitle className="text-green-800">Estimation Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Estimated Tiles Required</p>
                <p className="text-2xl font-bold text-green-800">{formatNumber(result.tilesRequired)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Estimated Total Cost</p>
                <p className="text-2xl font-bold text-green-800">{formatCurrency(result.totalCost)}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-800">
                <p className="font-medium">Important Notes:</p>
                <ul className="mt-1 space-y-1 text-xs">
                  <li>• This estimate includes 10% wastage for cutting and installation</li>
                  <li>• Actual cost may vary based on installation complexity</li>
                  <li>• Additional costs for adhesive, grout, and labor not included</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RoomEstimation;
