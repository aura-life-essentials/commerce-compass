// Product image imports - Pixar-style AI generated images
import galaxyProjector from "@/assets/products/galaxy-projector.jpg";
import neckFan from "@/assets/products/neck-fan.jpg";
import phoneMount from "@/assets/products/phone-mount.jpg";
import sunriseClock from "@/assets/products/sunrise-clock.jpg";
import portableBlender from "@/assets/products/portable-blender.jpg";
import ledStrips from "@/assets/products/led-strips.jpg";
import ringLight from "@/assets/products/ring-light.jpg";
import lashCurler from "@/assets/products/lash-curler.jpg";
import miniProjector from "@/assets/products/mini-projector.jpg";
import scalpMassager from "@/assets/products/scalp-massager.jpg";
import smartBottle from "@/assets/products/smart-bottle.jpg";
import chargingPad from "@/assets/products/charging-pad.jpg";
import pimplePatches from "@/assets/products/pimple-patches.jpg";
import laptopStand from "@/assets/products/laptop-stand.jpg";
import petRoller from "@/assets/products/pet-roller.jpg";
import massageGun from "@/assets/products/massage-gun.jpg";
import carVacuum from "@/assets/products/car-vacuum.jpg";
import soapDispenser from "@/assets/products/soap-dispenser.jpg";
import blueLightGlasses from "@/assets/products/blue-light-glasses.jpg";
import travelTumbler from "@/assets/products/travel-tumbler.jpg";

// Map of image path patterns to actual imports
const imageMap: Record<string, string> = {
  "galaxy-projector": galaxyProjector,
  "neck-fan": neckFan,
  "phone-mount": phoneMount,
  "sunrise-clock": sunriseClock,
  "portable-blender": portableBlender,
  "led-strips": ledStrips,
  "ring-light": ringLight,
  "lash-curler": lashCurler,
  "mini-projector": miniProjector,
  "scalp-massager": scalpMassager,
  "smart-bottle": smartBottle,
  "charging-pad": chargingPad,
  "pimple-patches": pimplePatches,
  "laptop-stand": laptopStand,
  "pet-roller": petRoller,
  "massage-gun": massageGun,
  "car-vacuum": carVacuum,
  "soap-dispenser": soapDispenser,
  "blue-light-glasses": blueLightGlasses,
  "travel-tumbler": travelTumbler,
};

// Title to image mapping for fallback
const titleToImageKey: Record<string, string> = {
  "LED Galaxy Projector Night Light": "galaxy-projector",
  "Portable Neck Fan": "neck-fan",
  "Magnetic Phone Mount for Car": "phone-mount",
  "Sunrise Alarm Clock": "sunrise-clock",
  "Portable Blender USB": "portable-blender",
  "LED Strip Lights RGB": "led-strips",
  "Selfie Ring Light with Tripod": "ring-light",
  "Heated Eyelash Curler": "lash-curler",
  "Mini Projector HD": "mini-projector",
  "Electric Scalp Massager": "scalp-massager",
  "Smart Water Bottle": "smart-bottle",
  "Wireless Charging Pad 3-in-1": "charging-pad",
  "Acne Pimple Patches": "pimple-patches",
  "Foldable Laptop Stand": "laptop-stand",
  "Pet Hair Remover Roller": "pet-roller",
  "Muscle Massage Gun": "massage-gun",
  "Car Vacuum Cleaner Wireless": "car-vacuum",
  "Automatic Soap Dispenser": "soap-dispenser",
  "Blue Light Blocking Glasses": "blue-light-glasses",
  "Insulated Travel Tumbler": "travel-tumbler",
};

export function getProductImage(imagePath?: string | null, title?: string): string {
  // Default fallback
  const defaultImage = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400";
  
  // Try to match by image path
  if (imagePath) {
    for (const [key, importedImage] of Object.entries(imageMap)) {
      if (imagePath.includes(key)) {
        return importedImage;
      }
    }
  }
  
  // Try to match by title
  if (title && titleToImageKey[title]) {
    const key = titleToImageKey[title];
    if (imageMap[key]) {
      return imageMap[key];
    }
  }
  
  // Return the original path if it's a URL
  if (imagePath && (imagePath.startsWith('http') || imagePath.startsWith('data:'))) {
    return imagePath;
  }
  
  return defaultImage;
}

export { imageMap, titleToImageKey };
