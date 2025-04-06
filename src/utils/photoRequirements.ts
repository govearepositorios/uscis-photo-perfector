
// Constants for USCIS photo requirements
export const PHOTO_REQUIREMENTS = {
  width: 600, // 2 inches at 300 DPI
  height: 600, // 2 inches at 300 DPI
  minHeadHeight: 300, // 50% of photo height
  maxHeadHeight: 414, // 69% of photo height
  backgroundColor: "#FFFFFF", // Pure white background
  maxFileSizeKB: 4048, // Maximum file size in KB
  allowedFileTypes: ["image/jpeg", "image/png", "image/jpg"],
};

export type ValidationResult = {
  valid: boolean;
  message: string;
  type: "success" | "error" | "warning" | "info";
};

export type ProcessedImage = {
  originalUrl: string;
  processedUrl: string | null;
  width: number;
  height: number;
  headHeight?: number;
  headHeightPercentage?: number;
  validations: ValidationResult[];
};
