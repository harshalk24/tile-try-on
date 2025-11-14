import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Layout, Wand2 } from "lucide-react";

export type VisualizationType = "floor" | "walls" | "both";

interface VisualizationTypeSelectorProps {
  value: VisualizationType;
  onChange: (value: VisualizationType) => void;
}

const VisualizationTypeSelector = ({ value, onChange }: VisualizationTypeSelectorProps) => {
  return (
    <Card className="border border-border shadow-medium">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-5 w-5" />
          Visualization Type
        </CardTitle>
        <CardDescription>
          Choose what you want to visualize in your room
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup value={value} onValueChange={onChange} className="space-y-4">
          <div className="flex items-start space-x-3 space-y-0 rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => onChange("floor")}>
            <RadioGroupItem value="floor" id="floor" className="mt-1" />
            <div className="flex-1 space-y-1">
              <Label htmlFor="floor" className="text-base font-semibold cursor-pointer">
                Floor Only
              </Label>
              <p className="text-sm text-muted-foreground">
                Apply tiles only to the floor area
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 space-y-0 rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => onChange("walls")}>
            <RadioGroupItem value="walls" id="walls" className="mt-1" />
            <div className="flex-1 space-y-1">
              <Label htmlFor="walls" className="text-base font-semibold cursor-pointer">
                Walls Only
              </Label>
              <p className="text-sm text-muted-foreground">
                Apply tiles only to the wall surfaces
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 space-y-0 rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => onChange("both")}>
            <RadioGroupItem value="both" id="both" className="mt-1" />
            <div className="flex-1 space-y-1">
              <Label htmlFor="both" className="text-base font-semibold cursor-pointer">
                Floor + Walls
              </Label>
              <p className="text-sm text-muted-foreground">
                Apply different tiles to both floor and walls
              </p>
            </div>
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  );
};

export default VisualizationTypeSelector;


