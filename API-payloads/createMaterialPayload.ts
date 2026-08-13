import { RandomDataGenerator } from "../utils/randomDataGenerator";

export type MaterialType = 'raw' | 'consumable' | 'sparePart';

const MATERIAL_TYPES: Record<MaterialType, { materialTypeId: number; description: string }> = {
    raw: { materialTypeId: 75, description: 'raw material' },
    consumable: { materialTypeId: 84, description: 'consumable material' },
    sparePart: { materialTypeId: 83, description: 'spare part material' },
};

export const getMaterialPayload = (materialType: MaterialType = 'raw') => ({
    materialCode: "",
    materialName: RandomDataGenerator.getRandomMaterialName(),
    description: MATERIAL_TYPES[materialType].description,
    erpCode: "",
    materialCategoryId: 76,
    materialTypeId: MATERIAL_TYPES[materialType].materialTypeId,
    purchaseUomId: null,
    inventoryUomId: null,
    minimumOrderQuantity: 0,
    materialColorId: 0,
    materialFinishId: 0,
    materialThickness: 2.5,
    materialWeight: null,
    materialHeight: null,
    materialLength: 1220,
    materialDiameter: null,
    materialShelfLife: null,
    hsCodeId: 0,
    materialNatureId: [32],
    vendorId: [],
    standardPrice: 10,
    status: true,
    linkWithAssetId: 0,
    taxId: null,
    taxValue: null,
});
