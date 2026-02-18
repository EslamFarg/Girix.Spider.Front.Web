import { FormControl } from "@angular/forms";
import { IProductCreateRequest } from "../../services/product-service";
import { IFormImage } from "@/yn-ng/types/forms/IFormImage";

export type ProductFgControls = { [key in keyof IProductCreateRequest]: FormControl<IProductCreateRequest[key]> } & {
  images: FormControl<{ id: number; fullPath: string }[]>;
  allImages: FormControl<IFormImage[]>;
  imagesAdd: FormControl<File[]>;
  listIdsOfDeleteImages: FormControl<number[]>;
};

